"use client"

import * as React from "react"
import gsap from "gsap"

export interface CrowdCanvasProps {
  className?: string
  src?: string
}

export function CrowdCanvas({
  className = "w-full h-full",
  src = "https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png",
}: CrowdCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current || (document.getElementById("crowd-canvas") as HTMLCanvasElement)
    const heroSec = document.getElementById("hero-sec")
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const config = {
      src: src || "/peeps.png",
      rows: 15,
      cols: 7,
    }

    const randomRange = (min: number, max: number) => min + Math.random() * (max - min)
    const randomIndex = (array: any[]) => (randomRange(0, array.length) | 0)
    const removeFromArray = (array: any[], i: number) => array.splice(i, 1)[0]
    const removeItemFromArray = (array: any[], item: any) => removeFromArray(array, array.indexOf(item))
    const removeRandomFromArray = (array: any[]) => removeFromArray(array, randomIndex(array))
    const getRandomFromArray = (array: any[]) => array[randomIndex(array) | 0]

    const resetPeep = ({ stage, peep }: any) => {
      const direction = Math.random() > 0.5 ? 1 : -1
      const offsetY = 100 - 250 * gsap.parseEase("power2.in")(Math.random())
      const startY = stage.height - peep.height + offsetY
      let startX: number, endX: number

      if (direction === 1) {
        startX = -peep.width
        endX = stage.width
        peep.scaleX = 1
      } else {
        startX = stage.width + peep.width
        endX = 0
        peep.scaleX = -1
      }

      peep.x = startX
      peep.y = startY
      peep.anchorY = startY

      return { startX, startY, endX }
    }

    const normalWalk = ({ peep, props }: any) => {
      const { startX, startY, endX } = props
      const xDuration = 26
      const yDuration = 0.45

      const tl = gsap.timeline()
      tl.timeScale(randomRange(0.4, 0.75))
      tl.to(peep, { duration: xDuration, x: endX, ease: "none" }, 0)
      tl.to(peep, { duration: yDuration, repeat: Math.round(xDuration / yDuration), yoyo: true, y: startY - 8 }, 0)
      return tl
    }

    const walks = [normalWalk]

    const createPeep = ({ image, rect }: any) => {
      const peep: any = {
        image,
        rect: [],
        width: 0,
        height: 0,
        drawArgs: [],
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (r: number[]) => {
          peep.rect = r
          peep.width = r[2]
          peep.height = r[3]
          peep.drawArgs = [peep.image, ...r, 0, 0, peep.width, peep.height]
        },
        render: (c: CanvasRenderingContext2D) => {
          c.save()
          c.translate(peep.x, peep.y)
          c.scale(peep.scaleX, 1)
          c.drawImage(peep.image, peep.rect[0], peep.rect[1], peep.rect[2], peep.rect[3], 0, 0, peep.width, peep.height)
          c.restore()
        },
      }
      peep.setRect(rect)
      return peep
    }

    const img = document.createElement("img")
    img.crossOrigin = "anonymous"
    const stage = { width: 0, height: 0 }
    const allPeeps: any[] = []
    const availablePeeps: any[] = []
    const crowd: any[] = []
    let isHeroVisible = true

    const createPeeps = () => {
      const { rows, cols } = config
      const { naturalWidth: width, naturalHeight: height } = img
      const total = rows * cols
      const rectWidth = width / rows
      const rectHeight = height / cols

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [(i % rows) * rectWidth, ((i / rows) | 0) * rectHeight, rectWidth, rectHeight],
          })
        )
      }
    }

    const addPeepToCrowd = () => {
      const peep = removeRandomFromArray(availablePeeps)
      if (!peep) return null
      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({ peep, stage }),
      }).eventCallback("onComplete", () => {
        removePeepFromCrowd(peep)
        addPeepToCrowd()
      })

      peep.walk = walk
      crowd.push(peep)
      crowd.sort((a, b) => a.anchorY - b.anchorY)
      return peep
    }

    const removePeepFromCrowd = (peep: any) => {
      removeItemFromArray(crowd, peep)
      availablePeeps.push(peep)
    }

    const initCrowd = () => {
      while (availablePeeps.length) {
        const p = addPeepToCrowd()
        if (p && p.walk) {
          p.walk.progress(Math.random())
        }
      }
    }

    const render = () => {
      if (!isHeroVisible) return // Sleep when hero is off-screen!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      const dpr = window.devicePixelRatio || 1
      ctx.scale(dpr, dpr)
      crowd.forEach((peep) => peep.render(ctx))
      ctx.restore()
    }

    const resize = () => {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      stage.width = canvas.clientWidth
      stage.height = canvas.clientHeight
      canvas.width = stage.width * dpr
      canvas.height = stage.height * dpr

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill()
      })
      crowd.length = 0
      availablePeeps.length = 0
      availablePeeps.push(...allPeeps)
      initCrowd()
    }

    const init = () => {
      createPeeps()
      resize()
      gsap.ticker.add(render)
    }

    img.onerror = () => {
      // Fallback to local peeps.png if CDN fails
      if (img.src !== window.location.origin + "/peeps.png") {
        img.src = "/peeps.png"
      }
    }
    img.onload = init
    img.src = config.src

    window.addEventListener("resize", resize)

    let io: IntersectionObserver | null = null
    if (heroSec && window.IntersectionObserver) {
      io = new IntersectionObserver((entries) => {
        isHeroVisible = entries[0].isIntersecting
      })
      io.observe(heroSec)
    }

    return () => {
      window.removeEventListener("resize", resize)
      gsap.ticker.remove(render)
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill()
      })
      if (io) io.disconnect()
    }
  }, [src])

  return (
    <canvas
      id="crowd-canvas"
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  )
}

export default CrowdCanvas
