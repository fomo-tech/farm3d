# Mobile rendering power budget

The main world uses Babylon Engine.maxFPS: 30 FPS on coarse-pointer/narrow screens, 60 FPS on desktop. Engine-level pacing skips both scene simulation and GPU submission; engine frame deltas therefore retain elapsed time for movement and animation. Rendering remains disabled in the background.

Mobile requests low-power WebGL. Auto and Balanced cap density at 1.5 and the framebuffer at 1.8 million pixels; Eco uses 1x / 1 million pixels, Ultra retains its explicit 2x / 1.8 million budget. Auto and Balanced retain at least 1.25x density (subject to native density and pixel budget); Eco may reduce to .75. Mobile WebGL2 uses 2x MSAA on the scene target followed by the existing FXAA pass; Eco and unsupported hardware use single-sample FXAA. HTML HUD density is unaffected.

Mobile adaptation reacts to sustained frame times above 40 ms instead of treating the intentional 33.3 ms interval as overload; recovery below 35 ms allows restoration at stable 30 FPS. Shadows retain synchronized per-render light/depth updates to avoid flicker.

Validation: graphics settings tests exercise Babylon's actual pacing at 60 and 120 Hz, capped adaptation and portrait/landscape/tablet framebuffer budgets. Lighting stability regression passes. Physical temperature, battery life and GPU timings still require device measurement; no thermal improvement percentage is claimed.
