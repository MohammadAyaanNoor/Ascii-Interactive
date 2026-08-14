// Request: Fix Ascii.tsx in place so it compiles, is detected by Framer as a code component, and runs in the canvas and published site.
import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import {
    motion,
    useAnimate,
    stagger,
    cubicBezier,
    useInView,
} from "framer-motion"

interface FramerResponsiveImage {
    src?: string
    srcSet?: string
    alt?: string
}

interface MyComponentProps {
    firstLineText: string
    secondLineText: string
    textColor: string
    textureImage?: FramerResponsiveImage | string
    depthMapImage?: FramerResponsiveImage | string
    asciiColor: string
    waveGlowColor: string
    cellSize: number
    backgroundColor: string
    style?: React.CSSProperties
}

const FALLBACK_IMAGE_SRC =
    "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg"

const FALLBACK_IMAGE: FramerResponsiveImage = {
    src: FALLBACK_IMAGE_SRC,
    alt: "Gradient 5 - Green",
}

const ASCII_CHARS = " .,:;i1tfLCG08@"

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
}

function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
}

function getImageSrc(image?: FramerResponsiveImage | string): string {
    if (typeof image === "string" && image.trim().length > 0) return image
    if (image && typeof image === "object" && image.src) return image.src
    return FALLBACK_IMAGE_SRC
}

function createOffscreenCanvas(
    width: number,
    height: number
): HTMLCanvasElement {
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    return canvas
}

function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
): void {
    const iw = img.naturalWidth || img.width || 1
    const ih = img.naturalHeight || img.height || 1
    const ir = iw / ih
    const tr = targetWidth / targetHeight
    let sx = 0
    let sy = 0
    let sw = iw
    let sh = ih

    if (ir > tr) {
        sw = ih * tr
        sx = (iw - sw) * 0.5
    } else {
        sh = iw / tr
        sy = (ih - sh) * 0.5
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight)
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function AsciiEffectComponent(props: MyComponentProps) {
    const {
        firstLineText,
        secondLineText,
        textColor,
        textureImage = FALLBACK_IMAGE,
        depthMapImage = FALLBACK_IMAGE,
        asciiColor,
        waveGlowColor,
        cellSize,
        backgroundColor,
        style,
    } = props

    const isStatic = useIsStaticRenderer()
    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
    const [scope, animate] = useAnimate()
    const isInView = useInView(rootRef, { amount: 0.1 })

    const textureRef = React.useRef<HTMLImageElement | null>(null)
    const depthRef = React.useRef<HTMLImageElement | null>(null)
    const mouseRef = React.useRef({ x: 0.5, y: 0.5, active: false })
    const waveRef = React.useRef({
        x: 0.5,
        y: 0.5,
        startedAt: -1,
        colored: false,
    })
    const rafRef = React.useRef<number | null>(null)

    const safeCellSize = React.useMemo(
        () => clamp(Number(cellSize) || 8, 2, 20),
        [cellSize]
    )
    const safeTextColor = React.useMemo(
        () =>
            typeof textColor === "string" && textColor.trim().length > 0
                ? textColor
                : "#FFFFFF",
        [textColor]
    )
    const safeAsciiColor = React.useMemo(
        () =>
            typeof asciiColor === "string" && asciiColor.trim().length > 0
                ? asciiColor
                : "#ff4400",
        [asciiColor]
    )
    const safeWaveGlowColor = React.useMemo(
        () =>
            typeof waveGlowColor === "string" && waveGlowColor.trim().length > 0
                ? waveGlowColor
                : "#0088ff",
        [waveGlowColor]
    )
    const safeBackground = React.useMemo(
        () =>
            typeof backgroundColor === "string" &&
            backgroundColor.trim().length > 0
                ? backgroundColor
                : "#000000",
        [backgroundColor]
    )
    const safeFirstLine = React.useMemo(
        () =>
            typeof firstLineText === "string" && firstLineText.length > 0
                ? firstLineText
                : " ",
        [firstLineText]
    )
    const safeSecondLine = React.useMemo(
        () =>
            typeof secondLineText === "string" && secondLineText.length > 0
                ? secondLineText
                : " ",
        [secondLineText]
    )

    React.useEffect(() => {
        let cancelled = false
        if (typeof window === "undefined") return

        const texture = new window.Image()
        texture.crossOrigin = "anonymous"
        texture.decoding = "async"
        texture.src = getImageSrc(textureImage)
        texture.onload = () => {
            if (!cancelled) textureRef.current = texture
        }
        texture.onerror = () => {
            if (!cancelled) textureRef.current = null
        }

        return () => {
            cancelled = true
        }
    }, [textureImage])

    React.useEffect(() => {
        let cancelled = false
        if (typeof window === "undefined") return

        const depth = new window.Image()
        depth.crossOrigin = "anonymous"
        depth.decoding = "async"
        depth.src = getImageSrc(depthMapImage)
        depth.onload = () => {
            if (!cancelled) depthRef.current = depth
        }
        depth.onerror = () => {
            if (!cancelled) depthRef.current = null
        }

        return () => {
            cancelled = true
        }
    }, [depthMapImage])

    React.useEffect(() => {
        const ANIMATION_SPEED = 0.2
        const STAGGER_GAP = 0.2
        const easing = cubicBezier(0.35, 0.17, 0.3, 0.86)

        const runAnimations = async (): Promise<void> => {
            await animate(
                ".mask-yellow",
                { scaleX: 1 },
                {
                    duration: ANIMATION_SPEED,
                    ease: easing,
                    delay: stagger(STAGGER_GAP),
                }
            )
            animate(
                ".mask-yellow",
                { transformOrigin: "right" },
                { duration: 0 }
            )
            animate("h1", { opacity: 1 }, { duration: 0 })
            animate(
                ".mask-yellow",
                { scaleX: 0 },
                { duration: ANIMATION_SPEED, ease: easing, delay: stagger(0.1) }
            )

            await animate(
                ".mask-white",
                { scaleX: 1 },
                {
                    duration: ANIMATION_SPEED,
                    ease: easing,
                    delay: stagger(STAGGER_GAP, { startDelay: 0.1 }),
                }
            )
            animate(
                ".mask-white",
                { transformOrigin: "right" },
                { duration: 0 }
            )
            await animate(
                ".mask-white",
                { scaleX: 0 },
                {
                    duration: ANIMATION_SPEED,
                    ease: easing,
                    delay: stagger(STAGGER_GAP),
                }
            )
        }

        runAnimations()
    }, [animate])

    React.useEffect(() => {
        const root = rootRef.current
        if (!root) return

        const handlePointerMove = (event: PointerEvent): void => {
            const rect = root.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return
            mouseRef.current.active = true
            mouseRef.current.x = clamp(
                (event.clientX - rect.left) / rect.width,
                0,
                1
            )
            mouseRef.current.y = clamp(
                (event.clientY - rect.top) / rect.height,
                0,
                1
            )
        }
        const handlePointerLeave = (): void => {
            mouseRef.current.active = false
        }
        const handlePointerDown = (event: PointerEvent): void => {
            const rect = root.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return
            waveRef.current.x = clamp(
                (event.clientX - rect.left) / rect.width,
                0,
                1
            )
            waveRef.current.y = clamp(
                (event.clientY - rect.top) / rect.height,
                0,
                1
            )
            waveRef.current.colored = !waveRef.current.colored
            waveRef.current.startedAt = performance.now()
        }

        root.addEventListener("pointermove", handlePointerMove)
        root.addEventListener("pointerleave", handlePointerLeave)
        root.addEventListener("pointerdown", handlePointerDown)

        return () => {
            root.removeEventListener("pointermove", handlePointerMove)
            root.removeEventListener("pointerleave", handlePointerLeave)
            root.removeEventListener("pointerdown", handlePointerDown)
        }
    }, [])

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const canvas = canvasRef.current
        if (!canvas) return
        const root = rootRef.current
        if (!root) return

        const ctx = canvas.getContext("2d", { alpha: false })
        if (!ctx) return

        const render = (timeMs: number): void => {
            const width = Math.max(1, Math.floor(root.clientWidth))
            const height = Math.max(1, Math.floor(root.clientHeight))
            const dpr = clamp(window.devicePixelRatio || 1, 1, 2)

            const nextWidth = Math.max(1, Math.floor(width * dpr))
            const nextHeight = Math.max(1, Math.floor(height * dpr))
            if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
                canvas.width = nextWidth
                canvas.height = nextHeight
            }
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.fillStyle = safeBackground
            ctx.fillRect(0, 0, width, height)

            const cols = Math.max(2, Math.floor(width / safeCellSize))
            const rows = Math.max(2, Math.floor(height / safeCellSize))
            const texCanvas = createOffscreenCanvas(cols, rows)
            const texCtx = texCanvas.getContext("2d")
            if (!texCtx) return

            const sourceImage = textureRef.current
            if (sourceImage) {
                drawImageCover(texCtx, sourceImage, cols, rows)
            } else {
                const g = texCtx.createLinearGradient(0, 0, cols, rows)
                g.addColorStop(0, "#1b1b1b")
                g.addColorStop(1, "#808080")
                texCtx.fillStyle = g
                texCtx.fillRect(0, 0, cols, rows)
            }
            const texData = texCtx.getImageData(0, 0, cols, rows).data

            let depthData: Uint8ClampedArray | null = null
            const depthImage = depthRef.current
            if (depthImage) {
                const depthCanvas = createOffscreenCanvas(cols, rows)
                const depthCtx = depthCanvas.getContext("2d")
                if (depthCtx) {
                    drawImageCover(depthCtx, depthImage, cols, rows)
                    depthData = depthCtx.getImageData(0, 0, cols, rows).data
                }
            }

            const mouseX = mouseRef.current.x
            const mouseY = mouseRef.current.y
            const now = timeMs
            const waveElapsed =
                waveRef.current.startedAt < 0
                    ? 9999
                    : (now - waveRef.current.startedAt) / 1000
            const waveT = clamp(waveElapsed / 1.6, 0, 1)
            const waveRadius = easeOutCubic(waveT) * 1.4

            ctx.font = `${Math.max(8, safeCellSize)}px monospace`
            ctx.textBaseline = "top"

            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const i = (y * cols + x) * 4
                    const depth = depthData ? depthData[i] / 255 : 0.5
                    const parallaxCellsX = Math.round(
                        (mouseX - 0.5) * depth * 3
                    )
                    const parallaxCellsY = Math.round(
                        (mouseY - 0.5) * depth * 3
                    )
                    const sx = clamp(x + parallaxCellsX, 0, cols - 1)
                    const sy = clamp(y + parallaxCellsY, 0, rows - 1)
                    const si = (sy * cols + sx) * 4

                    const r = texData[si]
                    const g = texData[si + 1]
                    const b = texData[si + 2]
                    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255

                    const grain =
                        0.04 *
                        Math.sin((x * 12.9898 + y * 78.233 + now * 0.001) * 1.7)
                    const animatedLum = clamp(lum + grain, 0, 1)
                    const charIndex = Math.floor(
                        animatedLum * (ASCII_CHARS.length - 1)
                    )
                    const ch = ASCII_CHARS[charIndex] || " "

                    const ux = x / cols
                    const uy = y / rows
                    const dx = ux - waveRef.current.x
                    const dy = uy - waveRef.current.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    const waveBand = Math.exp(
                        -Math.pow((dist - waveRadius) / 0.045, 2)
                    )
                    const glow = clamp(waveBand * (1 - waveT), 0, 1)

                    const hoverDx = ux - mouseX
                    const hoverDy = uy - mouseY
                    const hoverDist = Math.sqrt(
                        hoverDx * hoverDx + hoverDy * hoverDy
                    )
                    const hoverMask = clamp(1 - hoverDist / 0.12, 0, 1)

                    const mode = waveRef.current.colored ? 1 : 0
                    const localMix = clamp(
                        mode * (1 - waveBand) +
                            (1 - mode) * waveBand +
                            hoverMask * 0.5,
                        0,
                        1
                    )

                    const baseA = 1 - localMix
                    const baseB = localMix
                    const glowColor = safeWaveGlowColor

                    ctx.fillStyle =
                        baseB > baseA
                            ? `rgba(${r},${g},${b},${clamp(0.35 + baseB * 0.9, 0, 1)})`
                            : safeAsciiColor
                    ctx.fillText(ch, x * safeCellSize, y * safeCellSize)

                    if (glow > 0.02) {
                        ctx.fillStyle = glowColor
                        ctx.globalAlpha = clamp(glow * 0.35, 0, 0.35)
                        ctx.fillText(ch, x * safeCellSize, y * safeCellSize)
                        ctx.globalAlpha = 1
                    }
                }
            }
        }

        const tick = (timeMs: number): void => {
            render(timeMs)
            if (!isStatic && isInView) {
                rafRef.current = window.requestAnimationFrame(tick)
            }
        }

        render(performance.now())
        if (!isStatic && isInView) {
            rafRef.current = window.requestAnimationFrame(tick)
        }

        return () => {
            if (rafRef.current !== null) {
                window.cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [
        isStatic,
        isInView,
        safeBackground,
        safeCellSize,
        safeAsciiColor,
        safeWaveGlowColor,
    ])

    return (
        <div
            ref={rootRef}
            style={{
                ...style,
                position: "relative",
                width: style?.width ?? "100%",
                height: style?.height ?? "100%",
                overflow: "hidden",
                backgroundColor: safeBackground,
            }}
        >
            <style>{`
                .framer-ascii-text-layer {
                    position: absolute;
                    z-index: 10;
                    pointer-events: none;
                    color: ${safeTextColor};
                    font-family: inherit;
                    padding: 4rem;
                }
                .mask-white, .mask-yellow {
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    z-index: -1;
                }
                .mask-white { background: #ffffff; }
                .mask-yellow { background: #ffff00; }
                .text-wrapper {
                    position: relative;
                    display: inline-block;
                    margin-bottom: 0.5rem;
                }
                .framer-ascii-h1 {
                    margin: 0;
                    line-height: 1.1;
                    font-size: 3rem;
                    text-transform: uppercase;
                }
                @media (max-width: 500px) {
                    .framer-ascii-text-layer { padding: 2rem; }
                    .framer-ascii-h1 { font-size: 2rem; }
                }
            `}</style>

            <canvas
                ref={canvasRef}
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                    zIndex: 1,
                }}
            />

            <div ref={scope} className="framer-ascii-text-layer">
                <div className="text-wrapper">
                    <motion.div
                        className="mask-white"
                        initial={{ scaleX: 0, transformOrigin: "left" }}
                    />
                    <motion.div
                        className="mask-yellow"
                        initial={{ scaleX: 0, transformOrigin: "left" }}
                    />
                    <motion.h1
                        className="framer-ascii-h1"
                        initial={{ opacity: 0 }}
                    >
                        {safeFirstLine}
                    </motion.h1>
                </div>
                <br />
                <div className="text-wrapper">
                    <motion.div
                        className="mask-white"
                        initial={{ scaleX: 0, transformOrigin: "left" }}
                    />
                    <motion.div
                        className="mask-yellow"
                        initial={{ scaleX: 0, transformOrigin: "left" }}
                    />
                    <motion.h1
                        className="framer-ascii-h1"
                        initial={{ opacity: 0 }}
                    >
                        {safeSecondLine}
                    </motion.h1>
                </div>
            </div>
        </div>
    )
}

addPropertyControls(AsciiEffectComponent, {
    firstLineText: {
        type: ControlType.String,
        defaultValue: "The digital landmark",
        title: "First Line",
    },
    secondLineText: {
        type: ControlType.String,
        defaultValue: "studio",
        title: "Second Line",
    },
    textColor: {
        type: ControlType.Color,
        defaultValue: "#000000",
        title: "Text Color",
    },
    textureImage: {
        type: ControlType.ResponsiveImage,
        title: "Main Texture",
    },
    depthMapImage: {
        type: ControlType.ResponsiveImage,
        title: "Depth Map Texture",
    },
    asciiColor: {
        type: ControlType.Color,
        defaultValue: "#ff4400",
        title: "ASCII Color",
    },
    waveGlowColor: {
        type: ControlType.Color,
        defaultValue: "#0088ff",
        title: "Glow Color",
    },
    cellSize: {
        type: ControlType.Number,
        defaultValue: 8,
        min: 2,
        max: 20,
        step: 1,
        title: "Cell Size",
    },
    backgroundColor: {
        type: ControlType.Color,
        defaultValue: "#FFFFFF",
        title: "Background",
    },
})
