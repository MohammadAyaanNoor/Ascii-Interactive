// import * as THREE from "three";

// export const AsciiShader = {
//   uniforms: {
//     // Post-processing texture uniform
//     inputBuffer: { value: null },
//     e0BlendOpacity: { value: 1.0 },
//     // Custom Uniforms
//     e0UCharacters: { value: null },
//     e0UCharactersCount: { value: 91.0 }, // Update to match your sprite sheet
//     e0UCellSize: { value: 8.0 },
//     e0UInvert: { value: false },
//     e0UColor: { value: new THREE.Color(0xff8800) },      // Bright orange
//     e0UColorDark: { value: new THREE.Color(0x441100) },
//     e0UTime: { value: 0.0 },
//     e0UMouse: { value: new THREE.Vector2(-1, -1) },
//     e0UClickPoint: { value: new THREE.Vector2(-1, -1) },
//     e0UProgress: { value: 1.0 },
//     e0UColorProgress: { value: 1.0 },
//     e0UEnableGooeyReveal: { value: true },
//     e0UGooeyIntensity: { value: 1.0 },
//     e0UGooeyRadius: { value: 0.1 },
//     e0UGooeySoftness: { value: 0.05 },
//     e0UGooeyNoiseIntensity: { value: 0.02 },
//     e0UImpactProgress: { value: 0.0 },
//     e0URevealOrigin: { value: new THREE.Vector2(0.5, 0.5) },
//     e0UDepthMap: { value: null },
//     e0UEnableDepthParallax: { value: false },
//     resolution: {
//       value: new THREE.Vector2(window.innerWidth, window.innerHeight),
//     },
//   },
//   vertexShader: `
  
// uniform vec2 resolution;
// uniform vec2 texelSize;
// uniform float cameraNear;
// uniform float cameraFar;
// uniform float aspect;
// uniform float time;
// varying vec2 vUv;
//  void main(){
//  vUv=position.xy*0.5+0.5;
//   gl_Position=vec4(position.xy,1.0,1.0);
//   }
  
//   `,
//   fragmentShader: `
//   // ShaderMaterial auto-injects: viewMatrix, cameraPosition, isOrthographic, precision.
// // Do not redeclare them here.

// #define PI 3.141592653589793

// highp float rand( const in vec2 uv ) {
//     const highp float a = 12.9898, b = 78.233, c = 43758.5453;
//     highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
//     return fract( sin( sn ) * c );
// }

// // Optional — only active if you set material.defines.ENCODE_OUTPUT
// // vec4 sRGBTransferOETF( in vec4 value ) {
// //     return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
// // }
// // vec4 linearToOutputTexel( vec4 value ) {
// //     return sRGBTransferOETF( vec4( value.rgb * mat3( 1.0000,-0.0000,-0.0000,-0.0000,1.0000,0.0000,0.0000,0.0000,1.0000 ), value.a ) );
// // }

// // Optional — only active if you set material.defines.DITHERING
// #ifdef DITHERING
// vec3 dithering( vec3 color ) {
//     float grid_position = rand( gl_FragCoord.xy );
//     vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
//     dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
//     return color + dither_shift_RGB;
// }
// #endif

// uniform mediump sampler2D inputBuffer;
// uniform vec2 resolution;

// varying vec2 vUv;

// uniform float e0BlendOpacity;
// uniform sampler2D e0UCharacters;
// uniform float e0UCharactersCount;
// uniform float e0UCellSize;
// uniform bool e0UInvert;
// uniform vec3 e0UColor;
// uniform float e0UAlphaThreshold;
// uniform bool e0URespectAlpha;
// uniform float e0UProgress;
// uniform float e0UColorProgress;
// uniform float e0URandomness;
// uniform bool e0UEnableGooeyReveal;
// uniform vec2 e0UMouse;
// uniform float e0UGooeyRadius;
// uniform float e0UGooeySoftness;
// uniform float e0UGooeyNoiseIntensity;
// uniform float e0UGooeyIntensity;
// uniform float e0UScrambleSeed;
// uniform float e0UTime;
// uniform sampler2D e0UDepthMap;
// uniform bool e0UEnableDepthParallax;
// uniform float e0UParallaxIntensity;
// uniform vec2 e0UParallaxOffset;
// uniform vec3 e0UColorDark;
// uniform float e0UDepthDetailMin;
// uniform vec2 e0UClickPoint;
// uniform float e0URadialInvert;
// uniform float e0UImpactProgress;
// uniform vec2 e0URevealOrigin;

// const vec2 SIZE = vec2(13.0, 7.0);

// float e0Hash(vec2 p) {
//     return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
// }

// vec2 e0Mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// vec3 e0Mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
// vec3 e0Permute(vec3 x) { return e0Mod289(((x*34.0)+1.0)*x); }

// float e0Snoise(vec2 v) {
//     const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//                         -0.577350269189626, 0.024390243902439);
//     vec2 i  = floor(v + dot(v, C.yy));
//     vec2 x0 = v - i + dot(i, C.xx);
//     vec2 i1;
//     i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//     vec4 x12 = x0.xyxy + C.xxzz;
//     x12.xy -= i1;
//     i = e0Mod289(i);
//     vec3 p = e0Permute(e0Permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
//     vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
//     m = m*m;
//     m = m*m;
//     vec3 x = 2.0 * fract(p * C.www) - 1.0;
//     vec3 h = abs(x) - 0.5;
//     vec3 ox = floor(x + 0.5);
//     vec3 a0 = x - ox;
//     m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
//     vec3 g;
//     g.x = a0.x * x0.x + h.x * x0.y;
//     g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//     return 130.0 * dot(m, g);
// }

// float e0GetLuminance(vec3 color) {
//     return dot(color, vec3(0.299, 0.587, 0.114));
// }

// void e0MainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
//     vec2 distortedUV = uv;
//     float depth = 0.5;
//     if (e0UEnableDepthParallax) {
//         depth = texture2D(e0UDepthMap, uv).r;
//         vec2 displacement = e0UParallaxOffset * depth * e0UParallaxIntensity;
//         distortedUV = uv + displacement;
//     }

//     vec2 cell = resolution / e0UCellSize;
//     vec2 grid = 1.0 / cell;
//     vec2 pixelizedUV = grid * (0.5 + floor(distortedUV / grid));
//     vec4 pixelized = texture2D(inputBuffer, pixelizedUV);

//     vec4 original = texture2D(inputBuffer, distortedUV);

//     if (e0URespectAlpha && pixelized.a < e0UAlphaThreshold) {
//         outputColor = vec4(0.0, 0.0, 0.0, 0.0);
//         return;
//     }

//     vec2 cellCoord = floor(uv / grid);

//     float gooeyBlend = 0.0;
//     if (e0UEnableGooeyReveal && e0UGooeyIntensity > 0.01 && e0UMouse.x > -0.5) {
//         vec2 aspectC = vec2(resolution.x / resolution.y, 1.0);
//         vec2 cellCenterCorrected = pixelizedUV * aspectC;
//         vec2 mouseCorrected = e0UMouse * aspectC;
//         float dist = distance(cellCenterCorrected, mouseCorrected);
//         float gooeyRandom = e0Hash(cellCoord) * e0UGooeyNoiseIntensity * 2.0;
//         float timeOffset = sin(e0UTime * 1.5 + e0Hash(cellCoord * 1.7) * 6.28) * e0UGooeyNoiseIntensity * 0.3;
//         float distortedDist = dist + gooeyRandom + timeOffset;
//         float animatedRadius = e0UGooeyRadius * e0UGooeyIntensity;
//         float softness = e0UGooeySoftness * e0UGooeyIntensity * 0.5;
//         gooeyBlend = 1.0 - smoothstep(animatedRadius - softness, animatedRadius + softness, distortedDist);
//     }

//     float luminance = e0GetLuminance(pixelized.rgb);
//     luminance = smoothstep(0.0, 1.0, luminance);
//     luminance = pow(luminance, 1.3);

//     if (e0UInvert) {
//         luminance = 1.0 - luminance;
//     }

//     float depthDetail = e0UEnableDepthParallax ? mix(e0UDepthDetailMin, 1.0, depth) : 1.0;
//     float characterIndex = floor((e0UCharactersCount - 1.0) * depthDetail * clamp(luminance, 0.0, 1.0));

//     if (gooeyBlend > 0.0) {
//         float scramble = e0Hash(cellCoord + e0UScrambleSeed);
//         characterIndex = floor(mod(characterIndex + scramble * e0UCharactersCount * luminance, e0UCharactersCount));
//     }

//     vec2 characterPosition = vec2(mod(characterIndex, SIZE.x), floor(characterIndex / SIZE.y));
//     vec2 offset = vec2(characterPosition.x, -characterPosition.y) / SIZE;
//     vec2 charUV = mod(distortedUV * (cell / SIZE), 1.0 / SIZE) - vec2(0., 1.0 / SIZE) + offset;
//     vec4 asciiCharacter = texture2D(e0UCharacters, charUV);

//     float charVisibility = asciiCharacter.r;
//     float finalAlpha = charVisibility;

//     if (e0URespectAlpha) {
//         finalAlpha *= smoothstep(e0UAlphaThreshold, e0UAlphaThreshold + 0.2, pixelized.a);
//     }

//     float visibility = 1.0;
//     float colorBlend = 1.0;
//     float ripple = 0.0;
//     float rawNormDist = 0.0;

//     vec2 originCell = e0URevealOrigin * cell;
//     vec2 revealDiff = cellCoord - originCell;
//     float revealDist = length(revealDiff);
//     float rd1 = length(vec2(0.0, 0.0) - originCell);
//     float rd2 = length(vec2(cell.x, 0.0) - originCell);
//     float rd3 = length(vec2(0.0, cell.y) - originCell);
//     float rd4 = length(cell - originCell);
//     float revealMaxDist = max(max(rd1, rd2), max(rd3, rd4));
//     float revealNormDist = revealDist / max(revealMaxDist, 1.0);
//     float cellRandom = e0Hash(cellCoord) * e0URandomness * 0.15;
//     float revealThreshold = revealNormDist + cellRandom + 0.06;

//     float revealScale = 1.0 + e0URandomness * 0.3 + 0.1;
//     float scaledProgress = e0UProgress * revealScale;
//     float visibilityRaw = smoothstep(scaledProgress - 0.05, scaledProgress + 0.05, revealThreshold);
//     visibility = 1.0 - visibilityRaw;

//     float visRippleDist = revealThreshold - scaledProgress;
//     float visRipple = exp(-visRippleDist * visRippleDist * 180.0);

//     if (e0UClickPoint.x >= 0.0) {
//         vec2 clickCell = e0UClickPoint * cell;
//         vec2 diff = cellCoord - clickCell;
//         float dist = length(diff);
//         float d1 = length(vec2(0.0, 0.0) - clickCell);
//         float d2 = length(vec2(cell.x, 0.0) - clickCell);
//         float d3 = length(vec2(0.0, cell.y) - clickCell);
//         float d4 = length(cell - clickCell);
//         float maxDist = max(max(d1, d2), max(d3, d4));
//         float normDist = dist / max(maxDist, 1.0);
//         rawNormDist = normDist;
//         if (e0URadialInvert > 0.5) {
//             normDist = 1.0 - normDist;
//         }
//         float radialRandom = e0Hash(cellCoord) * e0URandomness * 0.15;
//         float radialThreshold = normDist + radialRandom;
//         float radialScale = 1.0 + e0URandomness * 0.3;
//         float scaledRadial = e0UColorProgress * radialScale;
//         float radialRaw = smoothstep(scaledRadial - 0.05, scaledRadial + 0.05, radialThreshold);
//         colorBlend = 1.0 - radialRaw;

//         float rippleDist = radialThreshold - scaledRadial;
//         ripple = exp(-rippleDist * rippleDist * 180.0) * max(0.0, 1.0 - rawNormDist * 0.7);
//     } else {
//         float scaledColorProgress = e0UColorProgress * revealScale;
//         float colorRaw = smoothstep(scaledColorProgress - 0.05, scaledColorProgress + 0.05, revealThreshold);
//         colorBlend = 1.0 - colorRaw;

//         float colorRippleDist = revealThreshold - scaledColorProgress;
//         ripple = exp(-colorRippleDist * colorRippleDist * 180.0);
//     }

//     ripple += visRipple;

//     finalAlpha *= visibility;
//     vec3 targetColor = mix(e0UColorDark, e0UColor, luminance);
//     vec3 finalColor = mix(pixelized.rgb, targetColor, colorBlend);

//     if (ripple > 0.01) {
//         finalColor += ripple * 0.35;
//     }

//     if (e0UClickPoint.x >= 0.0 && e0UImpactProgress > 0.0 && e0UImpactProgress < 1.0) {
//         float impactRadius = 0.03 + e0UImpactProgress * 0.18;
//         float impactFade = 1.0 - e0UImpactProgress;
//         float impact = impactFade * exp(-rawNormDist * rawNormDist / (2.0 * impactRadius * impactRadius));
//         finalColor += impact * 0.35;
//     }

//     if (gooeyBlend > 0.0) {
//         float sharpBlend = smoothstep(0.0, 0.15, gooeyBlend);
//         vec3 gooeyTarget = mix(targetColor, original.rgb, colorBlend);
//         vec3 blendedColor = mix(finalColor, gooeyTarget, sharpBlend);
//         outputColor = vec4(blendedColor * finalAlpha, finalAlpha);
//         return;
//     }

//     outputColor = vec4(finalColor * finalAlpha, finalAlpha);
// }

// vec4 blend23(const in vec4 dst, const in vec4 src, const in float opacity) {
//     return mix(dst, src, opacity);
// }

// void main() {
//     vec4 color0 = texture2D(inputBuffer, vUv);
//     vec4 color1 = vec4(0.0);
//     e0MainImage(color0, vUv, color1);

//     color0 = blend23(color0, color1, e0BlendOpacity);
//     color0.a = clamp(color0.a, 0.0, 1.0);
//     gl_FragColor = color0;

// #ifdef DITHERING
//     gl_FragColor.rgb = dithering(gl_FragColor.rgb);
// #endif

// // #ifdef ENCODE_OUTPUT
// //     gl_FragColor = linearToOutputTexel(gl_FragColor);
// // #endif
// }
//   `,
// };



//old
import * as THREE from 'three';

export const AsciiShader = {
  uniforms: {
    inputBuffer: { value: null }, 
    iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    cellSize: { value: 8.0 },
    asciiColor: { value: new THREE.Color(0xff4400) },
    waveGlowColor: { value: new THREE.Color(0x0088ff) },
    
    mouse: { value: new THREE.Vector2(-1, -1) },
    maskRadius: { value: 0.05 },
    clickPos: { value: new THREE.Vector2(0.5, 0.5) },
    waveRadius: { value: 3.0 }, 
    isColored: { value: 0.0 },
    iTime: { value: 0.0 },

    // NEW: Depth map uniforms
    depthMap: { value: null },
    enableParallax: { value: true },
    parallaxIntensity: { value: 0.01 } // Tweak this for a stronger/weaker 3D pop
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform vec2 iResolution;
    uniform sampler2D inputBuffer;
    uniform float cellSize;
    uniform vec3 asciiColor;
    
    uniform vec2 mouse;
    uniform float maskRadius;
    uniform vec2 clickPos;
    uniform float waveRadius;
    uniform float isColored;
    uniform float iTime; 
    
    // NEW: Declare depth uniforms
    uniform sampler2D depthMap;
    uniform bool enableParallax;
    uniform float parallaxIntensity;

    varying vec2 vUv;

    // Procedural character generator
    float character(int n, vec2 p) {
        p = floor(p * vec2(-4.0, 4.0) + 2.5);
        if (clamp(p.x, 0.0, 4.0) == p.x) {
            if (clamp(p.y, 0.0, 4.0) == p.y) {
                int a = int(floor(p.x + 0.5) + 5.0 * floor(p.y + 0.5));
                if (((n >> a) & 1) == 1) return 1.0;
            }   
        }
        return 0.0;
    }
         // Returns the glyph int for a given brightness level [0,1].
    // Ramp goes from sparse (space) to dense (solid block), 12 steps.
    // Generated with the accompanying gen_glyphs.py script.
    // int glyphForBrightness(float gray) {
    //     // if (gray > 11.0 / 12.0) return 33554431;  // block   #####
    //     if (gray > 10.0 / 12.0) return 15397950;  // @       .###./#.#.#/#.###/#..../.####
    //     if (gray > 9.0  / 12.0) return 6593210;   // &
    //     if (gray > 8.0  / 12.0) return 11512810;  // #
    //     if (gray > 7.0  / 12.0) return 18092113;  // %
    //     if (gray > 6.0  / 12.0) return 22511061;  // *
    //     if (gray > 5.0  / 12.0) return 145536;    // +
    //     if (gray > 4.0  / 12.0) return 459200;    // =
    //     if (gray > 3.0  / 12.0) return 14336;     // -
    //     if (gray > 2.0  / 12.0) return 131200;    // :
    //     // if (gray > 1.0  / 12.0) return 4;         // .
    //     return 0;                                  // space
    // }
    int glyphForBrightness(float gray) {
        // 23-step scale mapped to your exact characters: 
        // B Z @ M W 8 X h j L V q d o m % & ? } ^ * f C
        
        if (gray > 22.0 / 23.0) return 6316310;  // C
        if (gray > 21.0 / 23.0) return 9390146;  // f
        if (gray > 20.0 / 23.0) return 459200;   // *
        if (gray > 19.0 / 23.0) return 131200;   // ^
        if (gray > 18.0 / 23.0) return 31710923; // }
        if (gray > 17.0 / 23.0) return 11512810; // ?
        if (gray > 16.0 / 23.0) return 6593210;  // &
        if (gray > 15.0 / 23.0) return 18092113; // %
        if (gray > 14.0 / 23.0) return 22511061; // m
        if (gray > 13.0 / 23.0) return 16962834; // o
        if (gray > 12.0 / 23.0) return 14826180; // d
        if (gray > 11.0 / 23.0) return 11317424; // q
        if (gray > 10.0 / 23.0) return 145536;   // V
        if (gray > 9.0  / 23.0) return 14336;    // L
        if (gray > 8.0  / 23.0) return 4;        // j
        if (gray > 7.0  / 23.0) return 15397950; // h
        if (gray > 6.0  / 23.0) return 14815374; // X
        if (gray > 5.0  / 23.0) return 17318430; // 8
        if (gray > 4.0  / 23.0) return 33059359; // W
        if (gray > 3.0  / 23.0) return 8521864;  // M
        if (gray > 2.0  / 23.0) return 15255086; // @
        if (gray > 1.0  / 23.0) return 18667121; // Z
        if (gray > 0.3  / 23.0) return 24192;    // B
        
        return 0;                                // space
    }
    

    void main() {
        // --- NEW: PARALLAX LOGIC ---
        vec2 activeUv = vUv;
        if (enableParallax) {
            float depth = texture2D(depthMap, vUv).r;
            // Center the mouse coordinate (-0.5 to 0.5) to shift the UVs
            vec2 offset = (mouse - vec2(0.5));
            activeUv += offset * depth * parallaxIntensity;
        }
        // ---------------------------

        // Calculate grid using the new activeUv
        vec2 pix = activeUv * iResolution.xy;
        vec2 pixelatedPix = floor(pix / cellSize) * cellSize;
        vec2 pixelatedUv = pixelatedPix / iResolution.xy;
        
        vec4 texColor = texture2D(inputBuffer, pixelatedUv);
        float gray = 0.3 * texColor.r + 0.59 * texColor.g + 0.11 * texColor.b;
        
        float animSpeed = 1.0; 
        float stepTime = floor(iTime * animSpeed);
        float cellHash = fract(sin(dot(pixelatedPix, vec2(12.9898, 78.233)) + stepTime) * 43758.5453);
        float animatedGray = gray + ((cellHash - 0.5) * 0.5 * gray);

         int n = glyphForBrightness(animatedGray);                       
        // if (animatedGray > 4.0 / 25.0) n = 4;        
        // if (animatedGray > 5.0 / 25.0) n = 8521864;  
        // if (animatedGray > 8.0 / 25.0) n = 17318430; 
        // if (animatedGray > 9.0 / 25.0) n = 14815374; 
        // if (animatedGray > 12.0 / 25.0) n = 15255086;
        // if (animatedGray > 13.0 / 25.0) n = 18667121;
        // if (animatedGray > 15.0 / 25.0) n = 33059359;
       
        
       vec2 p = mod(pix / (cellSize / 2.0), 2.0) - vec2(1.0);
        
        // --- NEW: EXTRACT CHARACTER SHAPE ---
        // Store the 0.0 or 1.0 value so we can mask the glow later
        float charShape = character(n, p);
        
        vec3 orangeAscii = asciiColor * charShape * (animatedGray * 1.5);
        vec3 originalColoredAscii = texColor.rgb * charShape;
        
        vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
        
        // 1. Calculate the wave distance and base mask
        float waveDist = distance(activeUv * aspect, clickPos * aspect);
        float waveMask = 1.0 - smoothstep(waveRadius - 0.05, waveRadius, waveDist);
        
        // 2. Isolate the exact geometric edge of the expanding wave
        float edgeDist = abs(waveDist - waveRadius);
        float glowMask = 1.0 - smoothstep(0.0, 0.06, edgeDist);
        glowMask = pow(glowMask, 2.0);
        
        float glowFade = 1.0 - smoothstep(1.5, 3.0, waveRadius);
        float finalGlow = glowMask * glowFade;
        
        // 3. Logic for flipping colors
        float currentMode = mix(1.0 - isColored, isColored, waveMask);
        
        // 4. Hover flashlight mask
        float hoverDist = distance(activeUv * aspect, mouse * aspect);
        float hoverMask = 1.0 - smoothstep(maskRadius * 0.5, maskRadius, hoverDist);
        
        // 5. Smart blend the masks together
        float finalMask = abs(currentMode - hoverMask);
        vec3 finalColor = mix(orangeAscii, originalColoredAscii, finalMask);
        
        // --- NEW: MASKED ADDITIVE BLEND ---
        // Multiply the blue light by 'charShape' so the empty black spaces stay pure black
        vec3 blueLight = vec3(0.0, 0.6, 1.0);
        finalColor += blueLight * finalGlow * 0.9 * charShape;
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};






//latest with sprite sheet
// import * as THREE from 'three';

// export const AsciiShader = {
//   uniforms: {
//     inputBuffer: { value: null }, 
//     iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//     cellSize: { value: 8.0 }, // Tweak cell size (e.g., 8 to 14)
//     asciiColor: { value: new THREE.Color(0xff4400) }, // Your vibrant brand orange
    
//     waveGlowColor: { value: new THREE.Color(0x0088ff) }, 
//     mouse: { value: new THREE.Vector2(-1, -1) },
//     maskRadius: { value: 0.15 },
//     clickPos: { value: new THREE.Vector2(0.5, 0.5) },
//     waveRadius: { value: 3.0 }, 
//     isColored: { value: 0.0 },
//     iTime: { value: 0.0 },

//     depthMap: { value: null },
//     enableParallax: { value: true },
//     parallaxIntensity: { value: 0.05 },

//     // NEW: Sprite sheet uniform
//     uTexture: { value: null }
//   },
  
//   vertexShader: `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
  
//   fragmentShader: `
//     uniform vec2 iResolution;
//     uniform sampler2D inputBuffer;
//     uniform float cellSize;
//     uniform vec3 asciiColor;
//     uniform vec3 waveGlowColor;
    
//     uniform vec2 mouse;
//     uniform float maskRadius;
//     uniform vec2 clickPos;
//     uniform float waveRadius;
//     uniform float isColored;
//     uniform float iTime; 
    
//     uniform sampler2D depthMap;
//     uniform bool enableParallax;
//     uniform float parallaxIntensity;

//     uniform sampler2D uTexture;

//     varying vec2 vUv;

//     void main() {
//         vec2 activeUv = vUv;
//         if (enableParallax) {
//             float depth = texture2D(depthMap, vUv).r;
//             vec2 offset = (mouse - vec2(0.5));
//             activeUv += offset * depth * parallaxIntensity;
//         }

//         // Screen pixel coordinates mapped to the cell grid
//         vec2 pix = activeUv * iResolution.xy;
//         vec2 grid = floor(pix / cellSize);
//         vec2 pixelatedUv = (grid * cellSize + cellSize * 0.5) / iResolution.xy;
        
//         vec4 texColor = texture2D(inputBuffer, pixelatedUv);
//         float gray = 0.3 * texColor.r + 0.59 * texColor.g + 0.11 * texColor.b;
        
//         // Optional: slight time-based variation for motion
//         float stepTime = floor(iTime * 1.0);
//         float cellHash = fract(sin(dot(grid, vec2(12.9898, 78.233)) + stepTime) * 43758.5453);
//         float animatedGray = clamp(gray + ((cellHash - 0.5) * 0.2 * gray), 0.0, 1.0);

//         // --- ATLAS MAPPING MATH ---
//         // Your sprite sheet layout: 13 columns, 7 rows = 91 characters total
//         vec2 sheetSize = vec2(16.0, 16.0);
        
//         // Map grayscale (0.0 to 1.0) to a character index (0 to 90)
//         float totalChars = sheetSize.x * sheetSize.y;
//         float charIndex = floor(animatedGray * (totalChars - 1.0));
        
//         // Calculate column and row of the character in the sprite sheet
//         float col = mod(charIndex, sheetSize.x);
//         float row = floor(charIndex / sheetSize.x);
        
//         // Local UV inside the current character cell (0.0 to 1.0)
//         vec2 localUv = fract(pix / cellSize);
//         // Flip Y if your texture looks upside down: localUv.y = 1.0 - localUv.y;
        
//         // Map local UV to the specific slot on the sprite sheet atlas texture
//         vec2 atlasUv = (localUv + vec2(col, row)) / sheetSize;
        
//         // Sample the sprite sheet texture for this character shape (using .r or .a depending on your png)
//         float charShape = texture2D(uTexture, atlasUv).r;
//         // --------------------------

//         vec3 orangeAscii = asciiColor * charShape * (animatedGray * 1.5);
//         vec3 originalColoredAscii = texColor.rgb * charShape;
        
//         vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
        
//         float waveDist = distance(activeUv * aspect, clickPos * aspect);
//         float waveMask = 1.0 - smoothstep(waveRadius - 0.05, waveRadius, waveDist);
        
//         float edgeDist = abs(waveDist - waveRadius);
//         float glowMask = 1.0 - smoothstep(0.0, 0.06, edgeDist);
//         glowMask = pow(glowMask, 2.0);
        
//         float glowFade = 1.0 - smoothstep(1.5, 3.0, waveRadius);
//         float finalGlow = glowMask * glowFade;
        
//         float currentMode = mix(1.0 - isColored, isColored, waveMask);
//         float hoverDist = distance(activeUv * aspect, mouse * aspect);
//         float hoverMask = 1.0 - smoothstep(maskRadius * 0.5, maskRadius, hoverDist);
        
//         float finalMask = abs(currentMode - hoverMask);
//         vec3 finalColor = mix(orangeAscii, originalColoredAscii, finalMask);
        
//         vec3 blueLight = vec3(0.0, 0.6, 1.0);
//         finalColor += blueLight * finalGlow * 0.9 * charShape;
        
//         gl_FragColor = vec4(finalColor, 1.0);
//     }
//   `
// };


//procedural generated fonts
// import * as THREE from 'three';

// export const AsciiShader = {
//   uniforms: {
//     inputBuffer: { value: null }, 
//     iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//     cellSize: { value: 2.0 },
//     asciiColor: { value: new THREE.Color(0xff4400) }, 
//     waveGlowColor: { value: new THREE.Color(0x0088ff) }, 
    
//     mouse: { value: new THREE.Vector2(-1, -1) },
//     maskRadius: { value: 0.15 },
//     clickPos: { value: new THREE.Vector2(0.5, 0.5) },
//     waveRadius: { value: 3.0 }, 
//     isColored: { value: 0.0 },
//     iTime: { value: 0.0 },

//     depthMap: { value: null },
//     enableParallax: { value: true },
//     parallaxIntensity: { value: 0.05 }
//   },
  
//   vertexShader: `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `,
  
//   fragmentShader: `
//     uniform vec2 iResolution;
//     uniform sampler2D inputBuffer;
//     uniform float cellSize;
//     uniform vec3 asciiColor;
//     uniform vec3 waveGlowColor;
    
//     uniform vec2 mouse;
//     uniform float maskRadius;
//     uniform vec2 clickPos;
//     uniform float waveRadius;
//     uniform float isColored;
//     uniform float iTime; 
    
//     uniform sampler2D depthMap;
//     uniform bool enableParallax;
//     uniform float parallaxIntensity;

//     varying vec2 vUv;

//     // Procedural character bitmap selector (Returns 1.0 or 0.0 for pixel fill)
//    float getProceduralChar(int charIndex, vec2 p) {
//         // Normalize local cell coordinates to 0.0 - 4.0 grid
//         vec2 ip = floor(p * 4.0);
//         if (ip.x < 0.0 || ip.x > 3.0 || ip.y < 0.0 || ip.y > 4.0) return 0.0;
        
//         // Fix: Ensure all operands in the math expression are integers
//         int idx = int(ip.x) + int(ip.y) * 4;

//         int bits = 0;
//         if (charIndex == 0) bits = 0x69696; 
//         else if (charIndex == 1) bits = 0x52525; 
//         else if (charIndex == 2) bits = 0x74747; 
//         else if (charIndex == 3) bits = 0x63186; 
//         else if (charIndex == 4) bits = 0xF9F9F; 
//         else if (charIndex == 5) bits = 0xE8E8E; 
//         else if (charIndex == 6) bits = 0x9F9F9; 
//         else if (charIndex == 7) bits = 0xEDBDB; 
//         else if (charIndex == 8) bits = 0xADBDB; 
//         else if (charIndex == 9) bits = 0x6DB6D; 
//         else if (charIndex == 10) bits = 0xF99F9; 
//         else if (charIndex == 11) bits = 0x99F99; 
//         else if (charIndex == 12) bits = 0x69F96; 
//         else if (charIndex == 13) bits = 0xF6F6F; 
//         else bits = 0xFFFFF;                     

//         return float((bits >> idx) & 1);
//     }

//     void main() {
//         vec2 activeUv = vUv;
//         if (enableParallax) {
//             float depth = texture2D(depthMap, vUv).r;
//             vec2 offset = (mouse - vec2(0.5));
//             activeUv += offset * depth * parallaxIntensity;
//         }

//         vec2 pix = activeUv * iResolution.xy;
//         vec2 grid = floor(pix / cellSize);
//         vec2 pixelatedUv = (grid * cellSize + cellSize * 0.5) / iResolution.xy;
        
//         vec4 texColor = texture2D(inputBuffer, pixelatedUv);
//         float gray = 0.3 * texColor.r + 0.59 * texColor.g + 0.11 * texColor.b;
        
//         // Motion / Shifting effect every second
//         float stepTime = floor(iTime * 1.0);
//         float cellHash = fract(sin(dot(grid, vec2(12.9898, 78.233)) + stepTime) * 43758.5453);
//         float animatedGray = clamp(gray + ((cellHash - 0.5) * 0.25 * gray), 0.0, 1.0);

//         // Map grayscale brightness to our procedural character index (0 to 14)
//         int charIndex = int(animatedGray * 14.0);
        
//         // Local UV inside the cell (0.0 to 1.0)
//         vec2 localUv = fract(pix / cellSize);
//         float charShape = getProceduralChar(charIndex, localUv);

//         vec3 orangeAscii = asciiColor * charShape * (animatedGray * 1.5);
//         vec3 originalColoredAscii = texColor.rgb * charShape;
        
//         vec2 aspect = vec2(iResolution.x / iResolution.y, 1.0);
        
//         float waveDist = distance(activeUv * aspect, clickPos * aspect);
//         float waveMask = 1.0 - smoothstep(waveRadius - 0.05, waveRadius, waveDist);
        
//         float edgeDist = abs(waveDist - waveRadius);
//         float glowMask = 1.0 - smoothstep(0.0, 0.06, edgeDist);
//         glowMask = pow(glowMask, 2.0);
        
//         float glowFade = 1.0 - smoothstep(1.5, 3.0, waveRadius);
//         float finalGlow = glowMask * glowFade;
        
//         float currentMode = mix(1.0 - isColored, isColored, waveMask);
//         float hoverDist = distance(activeUv * aspect, mouse * aspect);
//         float hoverMask = 1.0 - smoothstep(maskRadius * 0.5, maskRadius, hoverDist);
        
//         float finalMask = abs(currentMode - hoverMask);
//         vec3 finalColor = mix(orangeAscii, originalColoredAscii, finalMask);
        
//         vec3 blueLight = vec3(0.0, 0.6, 1.0);
//         finalColor += blueLight * finalGlow * 0.9 * charShape;
        
//         gl_FragColor = vec4(finalColor, 1.0);
//     }
//   `
// };