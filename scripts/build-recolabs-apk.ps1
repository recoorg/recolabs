# Language: PowerShell, File: scripts/build-recolabs-apk.ps1
# Reco Labs Android APK Builder using Android SDK & JDK 21

$ErrorActionPreference = "Stop"

$RootDir = (Get-Item $PSScriptRoot).Parent.FullName
$BuildDir = Join-Path $RootDir "android-build"
$SdkDir = "C:\Users\bprasad\AppData\Local\Android\Sdk"
$BuildTools = Join-Path $SdkDir "build-tools\35.0.0"
$AndroidJar = Join-Path $SdkDir "platforms\android-36\android.jar"
$Javac = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot\bin\javac.exe"
$Keytool = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot\bin\keytool.exe"
$Jar = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.8-hotspot\bin\jar.exe"

$Aapt2 = Join-Path $BuildTools "aapt2.exe"
$D8 = Join-Path $BuildTools "d8.bat"
$Zipalign = Join-Path $BuildTools "zipalign.exe"
$Apksigner = Join-Path $BuildTools "apksigner.bat"

Write-Host ">>> Initializing Reco Labs Android APK Build Workspace..." -ForegroundColor Cyan

# 1. Prepare directory structure
if (Test-Path $BuildDir) {
    Remove-Item -Path $BuildDir -Recurse -Force
}
New-Item -ItemType Directory -Path "$BuildDir\res\values" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\res\drawable" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\src\in\recolabs\app" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\obj" -Force | Out-Null
New-Item -ItemType Directory -Path "$BuildDir\dex" -Force | Out-Null

# 2. Copy launcher icon from public logo
$SourceIcon = Join-Path $RootDir "public\logo.png"
if (Test-Path $SourceIcon) {
    Copy-Item $SourceIcon "$BuildDir\res\drawable\ic_launcher.png" -Force
} else {
    Copy-Item (Join-Path $RootDir "public\favicon.png") "$BuildDir\res\drawable\ic_launcher.png" -Force
}

function Write-Utf8NoBom([string]$path, [string]$content) {
    [System.IO.File]::WriteAllText($path, $content, (New-Object System.Text.UTF8Encoding($false)))
}

# 3. Create strings.xml & colors.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Reco Labs</string>
</resources>
"@ | ForEach-Object { Write-Utf8NoBom "$BuildDir\res\values\strings.xml" $_ }

@"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="primary">#FA5D00</color>
    <color name="dark">#09090B</color>
</resources>
"@ | ForEach-Object { Write-Utf8NoBom "$BuildDir\res\values\colors.xml" $_ }

# 4. Create AndroidManifest.xml
@"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="in.recolabs.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="35" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:roundIcon="@drawable/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar"
        android:usesCleartextTraffic="true"
        android:supportsRtl="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize|keyboardHidden|smallestScreenSize|screenLayout">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep linking for recolabs.in and www.recolabs.in -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="recolabs.in" />
                <data android:scheme="https" android:host="www.recolabs.in" />
            </intent-filter>

            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="recolabs" />
            </intent-filter>
        </activity>

    </application>
</manifest>
"@ | ForEach-Object { Write-Utf8NoBom "$BuildDir\AndroidManifest.xml" $_ }

# 5. Create MainActivity.java
@"
package in.recolabs.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.os.Bundle;
import java.util.List;

public class MainActivity extends Activity {
    private static final String DEFAULT_URL = "https://www.recolabs.in";
    private static final String EXTRA_CUSTOM_TABS_TOOLBAR_COLOR = "android.support.customtabs.extra.TOOLBAR_COLOR";
    private static final String EXTRA_CUSTOM_TABS_SHOW_TITLE = "android.support.customtabs.extra.TITLE_VISIBILITY";
    private static final String EXTRA_CUSTOM_TABS_ENABLE_URLBAR_HIDING = "android.support.customtabs.extra.ENABLE_URLBAR_HIDING";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent incoming) {
        String url = DEFAULT_URL;
        if (incoming != null && incoming.getData() != null) {
            String incomingUrl = incoming.getData().toString();
            if (incomingUrl.startsWith("http://") || incomingUrl.startsWith("https://")) {
                url = incomingUrl;
            }
        }
        launchCustomTab(url);
    }

    private void launchCustomTab(String targetUrl) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(targetUrl));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        
        // Dark theme toolbar matching Reco Labs brand identity (#09090b)
        intent.putExtra(EXTRA_CUSTOM_TABS_TOOLBAR_COLOR, 0xFF09090B);
        intent.putExtra(EXTRA_CUSTOM_TABS_SHOW_TITLE, 1);
        intent.putExtra(EXTRA_CUSTOM_TABS_ENABLE_URLBAR_HIDING, true);

        // Find browser supporting Custom Tabs (Chrome, Samsung Internet, Brave, Edge)
        PackageManager pm = getPackageManager();
        Intent serviceIntent = new Intent("android.support.customtabs.action.CustomTabsService");
        List<ResolveInfo> resolved = pm.queryIntentServices(serviceIntent, 0);

        String chosenPkg = null;
        for (ResolveInfo info : resolved) {
            String pkg = info.serviceInfo.packageName;
            if ("com.android.chrome".equals(pkg)) {
                chosenPkg = pkg;
                break;
            } else if (chosenPkg == null) {
                chosenPkg = pkg;
            }
        }

        if (chosenPkg != null) {
            intent.setPackage(chosenPkg);
        }

        try {
            startActivity(intent);
        } catch (Exception e) {
            intent.setPackage(null);
            try {
                startActivity(intent);
            } catch (Exception fallbackErr) {
                fallbackErr.printStackTrace();
            }
        }
        finish();
    }
}
"@ | ForEach-Object { Write-Utf8NoBom "$BuildDir\src\in\recolabs\app\MainActivity.java" $_ }

Write-Host ">>> Compiling Android resources with aapt2..." -ForegroundColor Cyan
& $Aapt2 compile --dir "$BuildDir\res" -o "$BuildDir\compiled_res.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

Write-Host ">>> Linking resources and manifest..." -ForegroundColor Cyan
& $Aapt2 link -I $AndroidJar --manifest "$BuildDir\AndroidManifest.xml" -o "$BuildDir\unaligned.apk" "$BuildDir\compiled_res.zip" --auto-add-overlay
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host ">>> Compiling Java classes with javac..." -ForegroundColor Cyan
& $Javac -source 11 -target 11 -cp $AndroidJar -d "$BuildDir\obj" "$BuildDir\src\in\recolabs\app\MainActivity.java"
if ($LASTEXITCODE -ne 0) { throw "javac failed" }

Write-Host ">>> Dexing bytecode with d8..." -ForegroundColor Cyan
& $D8 --lib $AndroidJar --output "$BuildDir\dex" (Get-ChildItem "$BuildDir\obj\in\recolabs\app\*.class").FullName
if ($LASTEXITCODE -ne 0) { throw "d8 failed" }

Write-Host ">>> Injecting classes.dex into APK..." -ForegroundColor Cyan
Push-Location "$BuildDir\dex"
& $Jar uf "$BuildDir\unaligned.apk" classes.dex
Pop-Location
if ($LASTEXITCODE -ne 0) { throw "jar injection failed" }

Write-Host ">>> ZipAligning APK..." -ForegroundColor Cyan
$AlignedApk = "$BuildDir\recolabs-aligned.apk"
if (Test-Path $AlignedApk) { Remove-Item $AlignedApk -Force }
& $Zipalign -f -v 4 "$BuildDir\unaligned.apk" $AlignedApk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host ">>> Creating release keystore..." -ForegroundColor Cyan
$Keystore = "$BuildDir\recolabs.keystore"
if (-not (Test-Path $Keystore)) {
    & $Keytool -genkeypair -v -keystore $Keystore -alias recolabs -keyalg RSA -keysize 2048 -validity 10000 -storepass recolabs123 -keypass recolabs123 -dname "CN=Reco Labs, OU=Guild, O=Reco Labs, L=Noida, ST=UP, C=IN"
}

Write-Host ">>> Signing APK with apksigner (v1, v2, v3)..." -ForegroundColor Cyan
$FinalApk = Join-Path $RootDir "recolabs.apk"
$PublicDownloadDir = Join-Path $RootDir "public\download"
if (-not (Test-Path $PublicDownloadDir)) { New-Item -ItemType Directory -Path $PublicDownloadDir -Force | Out-Null }
$PublicApk = Join-Path $PublicDownloadDir "recolabs.apk"

& $Apksigner sign --ks $Keystore --ks-pass "pass:recolabs123" --ks-key-alias recolabs --key-pass "pass:recolabs123" --out $FinalApk $AlignedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

Copy-Item $FinalApk $PublicApk -Force

Write-Host ">>> Verifying APK Signature..." -ForegroundColor Cyan
& $Apksigner verify --verbose $FinalApk

$ApkSize = (Get-Item $FinalApk).Length / 1KB
Write-Host ("`n[SUCCESS] Reco Labs APK successfully built!") -ForegroundColor Green
Write-Host ("- Root APK: {0} ({1:N1} KB)" -f $FinalApk, $ApkSize) -ForegroundColor Green
Write-Host ("- Web Download: {0}" -f $PublicApk) -ForegroundColor Green
