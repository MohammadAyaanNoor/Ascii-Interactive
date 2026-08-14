import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useAnimate, stagger, cubicBezier } from "framer-motion"
import * as THREE from "three"
import { Canvas, useThree, useFrame } from "@react-three/fiber"
import { motion } from "framer-motion-3d"

// Safe web fallback image to prevent TextureLoader from crashing on empty states
const FALLBACK_IMAGE =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zs5sAAAAASUVORK5CYII="

// --- 1. SHADER LOGIC (Adapted for WebGL 1.0 Safety & organic wave) ---
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`

const fragmentShader = `
    uniform vec2 iResolution;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float cellSize;
    uniform vec3 asciiColor;
    uniform vec3 waveGlowColor;
    uniform vec2 mouse;
    uniform float maskRadius;
    uniform vec2 clickPos;
    uniform float waveRadius;
    uniform float isColored;
    uniform float iTime; 
    uniform bool enableParallax;
    uniform float parallaxIntensity;

    varying vec2 vUv;

    // --- 2D Random & Noise Functions ---
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // Procedural character generator (Float version for WebGL 1.0 compatibility)
    float character(float n, vec2 p) {
        p = floor(p * vec2(-4.0, 4.0) + 2.5);
        if (clamp(p.x, 0.0, 4.0) == p.x) {
            if (clamp(p.y, 0.0, 4.0) == p.y) {
                float a = floor(p.x + 0.5) + 5.0 * floor(p.y + 0.5);
                if (mod(floor(n / exp2(a)), 2.0) == 1.0) return 1.0;
            }   
        }
        return 0.0;
    }

    float glyphForBrightness(float gray) {
        if (gray > 22.0 / 23.0) return 6316310.0;  
        if (gray > 21.0 / 23.0) return 9390146.0;  
        if (gray > 20.0 / 23.0) return 459200.0;   
        if (gray > 19.0 / 23.0) return 131200.0;   
        if (gray > 18.0 / 23.0) return 31710923.0; 
        if (gray > 17.0 / 23.0) return 11512810.0; 
        if (gray > 16.0 / 23.0) return 6593210.0;  
        if (gray > 15.0 / 23.0) return 18092113.0; 
        if (gray > 14.0 / 23.0) return 22511061.0; 
        if (gray > 13.0 / 23.0) return 16962834.0; 
        if (gray > 12.0 / 23.0) return 14826180.0; 
        if (gray > 11.0 / 23.0) return 11317424.0; 
        if (gray > 10.0 / 23.0) return 145536.0;   
        if (gray > 9.0  / 23.0) return 14336.0;    
        if (gray > 8.0  / 23.0) return 4.0;        
        if (gray > 7.0  / 23.0) return 15397950.0; 
        if (gray > 6.0  / 23.0) return 14815374.0; 
        if (gray > 5.0  / 23.0) return 17318430.0; 
        if (gray > 4.0  / 23.0) return 33059359.0; 
        if (gray > 3.0  / 23.0) return 8521864.0;  
        if (gray > 2.0  / 23.0) return 15255086.0; 
        if (gray > 1.0  / 23.0) return 18667121.0; 
        if (gray > 0.3  / 23.0) return 24192.0;    
        return 0.0;                                
    }
    
    void main() {
        vec2 activeUv = vUv;
        if (enableParallax) {
            float depth = texture2D(tDepth, vUv).r;
            vec2 offset = (mouse - vec2(0.5));
            activeUv += offset * depth * parallaxIntensity;
        }

        vec2 pix = activeUv * iResolution.xy;
        vec2 pixelatedPix = floor(pix / cellSize) * cellSize;
        vec2 pixelatedUv = pixelatedPix / iResolution.xy;
        
        vec4 texColor = texture2D(tDiffuse, pixelatedUv);
        float gray = 0.3 * texColor.r + 0.59 * texColor.g + 0.11 * texColor.b;
        
        float animSpeed = 0.7; 
        float stepTime = floor(iTime * animSpeed);
        float cellHash = fract(sin(dot(pixelatedPix, vec2(12.9898, 78.233)) + stepTime) * 43758.5453);
        float animatedGray = gray + ((cellHash - 0.5) * 0.5 * gray);

        float n = glyphForBrightness(animatedGray);                       
        
        vec2 p = mod(pix / (cellSize / 2.0), 2.0) - vec2(1.0);
        float charShape = character(n, p);
        
        vec3 orangeAscii = asciiColor * charShape * (animatedGray * 1.5);
        vec3 originalColoredAscii = texColor.rgb * charShape;
        
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
        
        // Organic, uneven wave thickness 
        vec2 waveDelta = (activeUv - clickPos) * aspect;
        float waveDist = length(waveDelta);
        vec2 waveDir = normalize(waveDelta); 
        
        float waveMask = 1.0 - smoothstep(waveRadius - 0.05, waveRadius, waveDist);
        float wNoise = noise(waveDir * 6.0 - iTime * 2.0);
        float waveThickness = 0.05 + (wNoise * 0.05);
        
        float edgeDist = abs(waveDist - waveRadius);
        float glowMask = 1.0 - smoothstep(0.0, waveThickness, edgeDist);
        glowMask = pow(glowMask, 2.0);
        
        float glowFade = 1.0 - smoothstep(1.5, 3.0, waveRadius);
        float finalGlow = glowMask * glowFade;
        
        float currentMode = mix(1.0 - isColored, isColored, waveMask);
        
        float hoverDist = distance(activeUv * aspect, mouse * aspect);
        float nNoise = noise(activeUv * 30.0 + iTime * 1.2); 
        float dynamicRadius = maskRadius * (0.7 + 0.6 * nNoise); 
        
        float hoverMask = 1.0 - smoothstep(dynamicRadius * 0.5, dynamicRadius, hoverDist);

        float finalMask = abs(currentMode - hoverMask);
        vec3 finalColor = mix(orangeAscii, originalColoredAscii, finalMask);
        
        finalColor += waveGlowColor * finalGlow * 0.9 * charShape;
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`

// --- 2. EASING FUNCTIONS ---
const easeInCubic = (t) => t * t * t

// --- 3. THE 3D SCENE ---
// function AsciiPlane({
//     textureUrl,
//     depthTextureUrl,
//     asciiColor,
//     waveGlowColor,
//     cellSize,
// }) {
//     const { size, viewport } = useThree()
//     const materialRef = React.useRef()

//     // Manual texture loading bypasses React Suspense entirely!
//     const [mainTex, setMainTex] = React.useState(null)
//     const [depthTex, setDepthTex] = React.useState(null)

//     React.useEffect(() => {
//         const loader = new THREE.TextureLoader()
//         const safeUrl =
//             textureUrl && textureUrl !== "" ? textureUrl : FALLBACK_IMAGE
//         const safeDepthUrl =
//             depthTextureUrl && depthTextureUrl !== ""
//                 ? depthTextureUrl
//                 : FALLBACK_IMAGE

//         loader.load(safeUrl, (tex) => setMainTex(tex))
//         loader.load(safeDepthUrl, (tex) => setDepthTex(tex))
//     }, [textureUrl, depthTextureUrl])

//     const waveProgress = React.useRef(1.0)
//     const isColoredState = React.useRef(false)
//     const targetMouse = React.useRef(new THREE.Vector2(-1, -1))

//     // Sizing Logic
//     const isMobile = size.width < 500
//     const planeWidth = viewport.width * (isMobile ? 1.1 : 0.7)
//     const planeHeight = viewport.height * (isMobile ? 1.0 : 0.8)
//     const positionX = -viewport.width / 2 + planeWidth / 2 + 0.5
//     const positionY = -viewport.height / 2 + planeHeight / 2

//     // Build uniforms dynamically
//     const uniforms = React.useMemo(() => {
//         if (!mainTex || !depthTex) return null
//         return {
//             tDiffuse: { value: mainTex },
//             tDepth: { value: depthTex },
//             iResolution: { value: new THREE.Vector2(size.width, size.height) },
//             cellSize: { value: cellSize },
//             asciiColor: { value: new THREE.Color(asciiColor) },
//             waveGlowColor: { value: new THREE.Color(waveGlowColor) },
//             mouse: { value: new THREE.Vector2(-1, -1) },
//             maskRadius: { value: maskRadius },
//             clickPos: { value: new THREE.Vector2(0.5, 0.5) },
//             waveRadius: { value: 2.0 },
//             isColored: { value: 0.0 },
//             iTime: { value: 0.0 },
//             enableParallax: { value: enableParallax },
//             parallaxIntensity: { value: parallaxIntensity },
//         }
//     }, [
        mainTex,
        depthTex,
        size,
        cellSize,
        asciiColor,
        waveGlowColor,
        maskRadius,
        enableParallax,
        parallaxIntensity,
    ])

//     useFrame((state, delta) => {
//         if (!materialRef.current || !uniforms) return

//         materialRef.current.uniforms.iTime.value = state.clock.elapsedTime

//         targetMouse.current.set(
//             (state.pointer.x + 1) / 2,
//             (state.pointer.y + 1) / 2
//         )
//         materialRef.current.uniforms.mouse.value.lerp(
//             targetMouse.current,
//             10 * delta
//         )

//         if (waveProgress.current < 1.0) {
//             waveProgress.current += delta * 0.8
//             if (waveProgress.current > 1.0) waveProgress.current = 1.0
//             const easedProgress = easeInCubic(waveProgress.current)
//             materialRef.current.uniforms.waveRadius.value = easedProgress * 1.5
//         }
//     })

//     const handleClick = (e) => {
//         if (!materialRef.current) return
//         e.stopPropagation()
//         isColoredState.current = !isColoredState.current
//         materialRef.current.uniforms.isColored.value = isColoredState.current
//             ? 1.0
//             : 0.0
//         materialRef.current.uniforms.clickPos.value.copy(
//             materialRef.current.uniforms.mouse.value
//         )
//         waveProgress.current = 0.0
//     }

//     // Do not render until textures are manually loaded
//     if (!uniforms) return null

//     return (
//         <mesh position={[positionX, positionY, 0]} onPointerDown={handleClick}>
//             <planeGeometry args={[planeWidth, planeHeight]} />
//             <shaderMaterial
//                 ref={materialRef}
//                 uniforms={uniforms}
//                 vertexShader={vertexShader}
//                 fragmentShader={fragmentShader}
//             />
//         </mesh>
//     )
// }
// --- 3. THE 3D SCENE ---
// --- 3. THE 3D SCENE ---
function AsciiPlane({
    textureUrl,
    depthTextureUrl,
    asciiColor,
    waveGlowColor,
    cellSize,
    planeWidthFactor,
    mobilePlaneWidthFactor,
    planeHeightFactor,
    mobilePlaneHeightFactor,
    positionXOffset,
    positionYOffset,
    enableParallax,
    parallaxIntensity,
    maskRadius,
    waveSpeed,
    waveMaxRadius,
    hoverSmoothing,
    hoverEnabled,
    clickEnabled,
}) {
    const { size, viewport } = useThree()
    const materialRef = React.useRef()

    const [mainTex, setMainTex] = React.useState(null)
    const [depthTex, setDepthTex] = React.useState(null)

    React.useEffect(() => {
        const loader = new THREE.TextureLoader()
        loader.setCrossOrigin("anonymous") 
        
        const safeUrl = textureUrl && textureUrl !== "" ? textureUrl : FALLBACK_IMAGE
        const safeDepthUrl =
            depthTextureUrl && depthTextureUrl !== ""
                ? depthTextureUrl
                : safeUrl

        loader.load(safeUrl, (tex) => setMainTex(tex))
        loader.load(safeDepthUrl, (tex) => setDepthTex(tex))
    }, [textureUrl, depthTextureUrl])

    const waveProgress = React.useRef(1.0)
    const isColoredState = React.useRef(false)
    const targetMouse = React.useRef(new THREE.Vector2(-1, -1))

    const isMobile = size.width < 500
    const planeWidth =
        viewport.width *
        (isMobile ? mobilePlaneWidthFactor : planeWidthFactor)
    const planeHeight =
        viewport.height *
        (isMobile ? mobilePlaneHeightFactor : planeHeightFactor)
    const positionX =
        -viewport.width / 2 + planeWidth / 2 + positionXOffset
    const positionY =
        -viewport.height / 2 + planeHeight / 2 + positionYOffset

    const uniforms = React.useMemo(() => {
        if (!mainTex || !depthTex) return null 
        return {
            tDiffuse: { value: mainTex },
            tDepth: { value: depthTex },
            iResolution: { value: new THREE.Vector2(size.width, size.height) },
            cellSize: { value: cellSize },
            asciiColor: { value: new THREE.Color(asciiColor) },
            waveGlowColor: { value: new THREE.Color(waveGlowColor) },
            mouse: { value: new THREE.Vector2(-1, -1) },
            maskRadius: { value: maskRadius },
            clickPos: { value: new THREE.Vector2(0.5, 0.5) },
            waveRadius: { value: 2.0 },
            isColored: { value: 0.0 },
            iTime: { value: 0.0 },
            enableParallax: { value: enableParallax },
            parallaxIntensity: { value: parallaxIntensity },
        }
    }, [
        mainTex,
        depthTex,
        size,
        cellSize,
        asciiColor,
        waveGlowColor,
        maskRadius,
        enableParallax,
        parallaxIntensity,
    ])

    useFrame((state, delta) => {
        if (!materialRef.current || !uniforms) return

        materialRef.current.uniforms.iTime.value = state.clock.elapsedTime

        // Smoothly interpolate the mouse position in the shader
        materialRef.current.uniforms.mouse.value.lerp(
            targetMouse.current,
            hoverSmoothing * delta
        )

        if (waveProgress.current < 1.0) {
            waveProgress.current += delta * waveSpeed
            if (waveProgress.current > 1.0) waveProgress.current = 1.0
            const easedProgress = easeInCubic(waveProgress.current)
            materialRef.current.uniforms.waveRadius.value =
                easedProgress * waveMaxRadius
        }
    })

    // ✅ NEW: Capture the exact UV coordinate on hover
    const handlePointerMove = (e) => {
        if (!hoverEnabled) return
        if (e.uv) {
            targetMouse.current.copy(e.uv)
        }
    }

    const handlePointerLeave = () => {
        targetMouse.current.set(-1, -1)
    }

    const handleClick = (e) => {
        if (!clickEnabled || !materialRef.current) return
        e.stopPropagation()
        isColoredState.current = !isColoredState.current
        materialRef.current.uniforms.isColored.value = isColoredState.current ? 1.0 : 0.0
        
        // ✅ NEW: Use exact UV coordinates for the click ripple origin
        if (e.uv) {
            materialRef.current.uniforms.clickPos.value.copy(e.uv)
        }
        
        waveProgress.current = 0.0
    }

    if (!uniforms) return null

    return (
        <motion.mesh 
            position={[positionX, positionY, 0]} 
            onPointerDown={clickEnabled ? handleClick : undefined}
            onPointerMove={hoverEnabled ? handlePointerMove : undefined}
            onPointerLeave={handlePointerLeave}
        >
            <planeGeometry args={[planeWidth, planeHeight]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </motion.mesh>
    )
}

// --- 4. MAIN FRAMER COMPONENT ---
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1200
 * @framerIntrinsicHeight 800
 */
export default function AsciiEffectComponent(props) {
    const [scope, animate] = useAnimate()
    const isStaticRenderer = useIsStaticRenderer()

    // SSR Bypass
    const [isMounted, setIsMounted] = React.useState(false)
    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    React.useEffect(() => {
        if (!isMounted) return
        const runAnimations = async () => {
            try {
                const ANIMATION_SPEED = props.textAnimationSpeed ?? 0.2
                const STAGGER_GAP = props.textStaggerGap ?? 0.2
                const easing = cubicBezier(0.35, 0.17, 0.3, 0.86)

                animate(
                    ".mask-yellow",
                    { scaleX: 1 },
                    {
                        duration: ANIMATION_SPEED,
                        ease: easing,
                        delay: stagger(STAGGER_GAP),
                    }
                ).then(() => {
                    animate(
                        ".mask-yellow",
                        { transformOrigin: "right" },
                        { duration: 0 }
                    )
                    animate("h1", { opacity: 1 }, { duration: 0 })
                    animate(
                        ".mask-yellow",
                        { scaleX: 0 },
                        {
                            duration: ANIMATION_SPEED,
                            ease: easing,
                            delay: stagger(0.1),
                        }
                    )
                })

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
            } catch (e) {}
        }
        runAnimations()
    }, [animate, isMounted, props.textAnimationSpeed, props.textStaggerGap])

    return (
        <div
            style={{
                display: "flex",
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: props.overflowVisible ? "visible" : "hidden",
                backgroundColor: props.backgroundColor,
                isolation: "isolate",
                ...props.style,
            }}
        >
            <style>{`
                .framer-ascii-text-layer {
                    position: absolute;
                    z-index: 10;
                    pointer-events: none;
                    color: ${props.textColor};
                    padding: ${props.textPadding ?? 64}px;
                    display: ${props.showText === false ? "none" : "block"};
                }
                .mask-white, .mask-yellow {
                    position: absolute;
                    top: 0;
                    left: 0;
                    bottom: 0;
                    right: 0;
                    z-index: -1;
                    transform: scaleX(0);
                    transform-origin: left;
                }
                .mask-white { background: ${props.whiteMaskColor || "#ffffff"}; }
                .mask-yellow { background: ${props.accentMaskColor || "#ffff00"}; }
                .text-wrapper {
                    position: relative;
                    display: inline-block;
                    margin-bottom: ${props.textLineGap ?? 8}px;
                }
                .framer-ascii-h1 {
                    margin: 0;
                    line-height: ${props.textLineHeight ?? 1.1};
                    font-size: ${props.textSize ?? 48}px;
                    font-weight: ${props.textWeight ?? 700};
                    text-transform: ${props.uppercaseText === false ? "none" : "uppercase"};
                    opacity: 0;
                }
                @media (max-width: 500px) {
                    .framer-ascii-text-layer { padding: ${props.mobileTextPadding ?? 32}px; }
                    .framer-ascii-h1 { font-size: ${props.mobileTextSize ?? 32}px; }
                }
            `}</style>

            <div ref={scope} className="framer-ascii-text-layer">
                <div className="text-wrapper">
                    <motion.div className="mask-white" />
                    <motion.div className="mask-yellow" />
                    {/* The text is now driven dynamically by the Framer property controls */}
                    <motion.h1 className="framer-ascii-h1">
                        {props.firstLineText}
                    </motion.h1>
                </div>
                <br />
                <div className="text-wrapper">
                    <motion.div className="mask-white" />
                    <motion.div className="mask-yellow" />
                    {/* The text is now driven dynamically by the Framer property controls */}
                    <motion.h1 className="framer-ascii-h1">
                        {props.secondLineText}
                    </motion.h1>
                </div>
            </div>

            <div
                style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 1,
                }}
            >
                {isMounted && !isStaticRenderer ? (
                    <Canvas
                        camera={{ position: [0, 0, 5] }}
                        dpr={[1, props.maxDpr || 1.5]}
                        gl={{
                            antialias: false,
                            alpha: true,
                            powerPreference: "high-performance",
                        }}
                    >
                        <AsciiPlane
                            textureUrl={props.textureImage || FALLBACK_IMAGE}
                            depthTextureUrl={
                                props.depthMapImage ||
                                props.textureImage ||
                                FALLBACK_IMAGE
                            }
                            asciiColor={props.asciiColor || "#ff4400"}
                            waveGlowColor={props.waveGlowColor || "#0088ff"}
                            cellSize={props.cellSize || 8.0}
                            planeWidthFactor={props.planeWidthFactor ?? 0.7}
                            mobilePlaneWidthFactor={
                                props.mobilePlaneWidthFactor ?? 1.1
                            }
                            planeHeightFactor={props.planeHeightFactor ?? 0.8}
                            mobilePlaneHeightFactor={
                                props.mobilePlaneHeightFactor ?? 1.0
                            }
                            positionXOffset={props.positionXOffset ?? 0.5}
                            positionYOffset={props.positionYOffset ?? 0}
                            enableParallax={props.enableParallax !== false}
                            parallaxIntensity={
                                props.parallaxIntensity ?? 0.01
                            }
                            maskRadius={props.maskRadius ?? 0.03}
                            waveSpeed={props.waveSpeed ?? 0.8}
                            waveMaxRadius={props.waveMaxRadius ?? 1.5}
                            hoverSmoothing={props.hoverSmoothing ?? 10}
                            hoverEnabled={props.hoverEnabled !== false}
                            clickEnabled={props.clickEnabled !== false}
                        />
                    </Canvas>
                ) : (
                    <img
                        src={props.textureImage || FALLBACK_IMAGE}
                        alt=""
                        draggable={false}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.75,
                            display: "block",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                    />
                )}
            </div>
        </div>
    )
}

// --- 5. FRAMER PROPERTY CONTROLS ---
// These appear on the right side of the Framer UI when you select the component.
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
    showText: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Show Text",
    },
    textColor: {
        type: ControlType.Color,
        defaultValue: "#ffffff",
        title: "Text Color",
        hidden: (props) => props.showText === false,
    },
    textSize: {
        type: ControlType.Number,
        defaultValue: 48,
        min: 12,
        max: 160,
        step: 1,
        unit: "px",
        title: "Text Size",
        hidden: (props) => props.showText === false,
    },
    mobileTextSize: {
        type: ControlType.Number,
        defaultValue: 32,
        min: 10,
        max: 100,
        step: 1,
        unit: "px",
        title: "Mobile Size",
        hidden: (props) => props.showText === false,
    },
    textWeight: {
        type: ControlType.Number,
        defaultValue: 700,
        min: 100,
        max: 900,
        step: 100,
        title: "Text Weight",
        hidden: (props) => props.showText === false,
    },
    textLineHeight: {
        type: ControlType.Number,
        defaultValue: 1.1,
        min: 0.8,
        max: 2,
        step: 0.05,
        title: "Line Height",
        hidden: (props) => props.showText === false,
    },
    textPadding: {
        type: ControlType.Number,
        defaultValue: 64,
        min: 0,
        max: 240,
        step: 1,
        unit: "px",
        title: "Text Padding",
        hidden: (props) => props.showText === false,
    },
    mobileTextPadding: {
        type: ControlType.Number,
        defaultValue: 32,
        min: 0,
        max: 160,
        step: 1,
        unit: "px",
        title: "Mobile Padding",
        hidden: (props) => props.showText === false,
    },
    textLineGap: {
        type: ControlType.Number,
        defaultValue: 8,
        min: 0,
        max: 80,
        step: 1,
        unit: "px",
        title: "Line Gap",
        hidden: (props) => props.showText === false,
    },
    uppercaseText: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Uppercase",
        hidden: (props) => props.showText === false,
    },
    textAnimationSpeed: {
        type: ControlType.Number,
        defaultValue: 0.2,
        min: 0.05,
        max: 2,
        step: 0.05,
        unit: "s",
        title: "Text Speed",
        hidden: (props) => props.showText === false,
    },
    textStaggerGap: {
        type: ControlType.Number,
        defaultValue: 0.2,
        min: 0,
        max: 1.5,
        step: 0.05,
        unit: "s",
        title: "Text Stagger",
        hidden: (props) => props.showText === false,
    },
    whiteMaskColor: {
        type: ControlType.Color,
        defaultValue: "#ffffff",
        title: "White Mask",
        hidden: (props) => props.showText === false,
    },
    accentMaskColor: {
        type: ControlType.Color,
        defaultValue: "#ffff00",
        title: "Accent Mask",
        hidden: (props) => props.showText === false,
    },

    textureImage: {
        type: ControlType.Image,
        title: "Main Texture",
    },
    depthMapImage: {
        type: ControlType.Image,
        title: "Depth Map",
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
        max: 30,
        step: 1,
        title: "Cell Size",
    },

    planeWidthFactor: {
        type: ControlType.Number,
        defaultValue: 0.7,
        min: 0.2,
        max: 1.6,
        step: 0.05,
        title: "Plane Width",
    },
    planeHeightFactor: {
        type: ControlType.Number,
        defaultValue: 0.8,
        min: 0.2,
        max: 1.6,
        step: 0.05,
        title: "Plane Height",
    },
    mobilePlaneWidthFactor: {
        type: ControlType.Number,
        defaultValue: 1.1,
        min: 0.2,
        max: 2,
        step: 0.05,
        title: "Mobile Width",
    },
    mobilePlaneHeightFactor: {
        type: ControlType.Number,
        defaultValue: 1,
        min: 0.2,
        max: 2,
        step: 0.05,
        title: "Mobile Height",
    },
    positionXOffset: {
        type: ControlType.Number,
        defaultValue: 0.5,
        min: -5,
        max: 5,
        step: 0.05,
        title: "Position X",
    },
    positionYOffset: {
        type: ControlType.Number,
        defaultValue: 0,
        min: -5,
        max: 5,
        step: 0.05,
        title: "Position Y",
    },

    hoverEnabled: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Hover Reveal",
    },
    maskRadius: {
        type: ControlType.Number,
        defaultValue: 0.03,
        min: 0.005,
        max: 0.3,
        step: 0.005,
        title: "Hover Radius",
        hidden: (props) => props.hoverEnabled === false,
    },
    hoverSmoothing: {
        type: ControlType.Number,
        defaultValue: 10,
        min: 1,
        max: 30,
        step: 1,
        title: "Hover Smooth",
        hidden: (props) => props.hoverEnabled === false,
    },
    clickEnabled: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Click Wave",
    },
    waveSpeed: {
        type: ControlType.Number,
        defaultValue: 0.8,
        min: 0.1,
        max: 4,
        step: 0.1,
        title: "Wave Speed",
        hidden: (props) => props.clickEnabled === false,
    },
    waveMaxRadius: {
        type: ControlType.Number,
        defaultValue: 1.5,
        min: 0.2,
        max: 4,
        step: 0.1,
        title: "Wave Radius",
        hidden: (props) => props.clickEnabled === false,
    },
    enableParallax: {
        type: ControlType.Boolean,
        defaultValue: true,
        title: "Parallax",
    },
    parallaxIntensity: {
        type: ControlType.Number,
        defaultValue: 0.01,
        min: 0,
        max: 0.1,
        step: 0.002,
        title: "Parallax Power",
        hidden: (props) => props.enableParallax === false,
    },

    maxDpr: {
        type: ControlType.Number,
        defaultValue: 1.5,
        min: 1,
        max: 2,
        step: 0.25,
        title: "Max DPR",
    },
    backgroundColor: {
        type: ControlType.Color,
        defaultValue: "#000000",
        title: "Background",
    },
    overflowVisible: {
        type: ControlType.Boolean,
        defaultValue: false,
        title: "Overflow",
        enabledTitle: "Visible",
        disabledTitle: "Clip",
    },
})
