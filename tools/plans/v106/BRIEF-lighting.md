# His brief for v1.06 lighting + shadows (2026-10-17, verbatim)

FLAVIUS RULE — AAA LIGHTING & SHADOW RENDERING OVERHAUL

ROLE & MISSION
Act as a senior AAA graphics programmer, real-time rendering engineer, technical artist, lighting director, and performance engineer.
Your assignment is to deliver a production-quality lighting and shadow overhaul for Flavius Rule, a turn-based gladiatorial strategy game rendered in HTML5 Canvas using JavaScript.
This is an implementation task, not a conceptual design exercise. Inspect the existing codebase, understand its rendering architecture, identify the highest-impact improvements, and implement them directly.
The objective is to make the game look substantially more polished, dimensional, atmospheric, and visually cohesive through professional lighting and shadow techniques, without compromising gameplay readability, performance, or the established art direction.

1. UNDERSTAND THE EXISTING GAME FIRST
Before modifying code:
1. Inspect the current rendering pipeline, canvas dimensions, coordinate systems, arena grid, tile rendering, entity rendering, sprite handling, UI composition, and animation loop.
2. Identify how the isometric 13×13 arena, gladiators, beasts, environmental objects, projectiles, effects, and interface elements are drawn.
3. Determine whether the game uses sprites, procedural drawing, gradients, existing lighting effects, or a combination.
4. Map the rendering order and identify where lighting, shadows, and atmospheric effects can be integrated with minimal disruption.
5. Establish a visual and performance baseline before implementation.
Do not assume that a particular rendering technique is appropriate until you understand how the existing renderer works.
Preserve the existing game. Do not rewrite the engine, replace the rendering architecture, change game rules, alter collision or movement logic, redesign the UI, or replace the art assets unless explicitly necessary and justified.

2. VISUAL DIRECTION
Create the visual quality of a premium, carefully art-directed strategy game.
The desired result combines:
* Cinematic environmental lighting.
* Convincing contact shadows and grounding.
* Strong visual separation between foreground and background.
* Rich, readable materials and surface detail.
* Subtle atmospheric depth.
* Consistent light direction and intensity.
* Refined highlights and ambient occlusion.
* Carefully restrained visual effects.
The aesthetic must remain appropriate for an ancient Roman gladiatorial arena. It should feel like an illustrated, stylized strategy game with sophisticated rendering rather than a photorealistic simulator.
Avoid turning the arena into a dark, muddy, oversaturated, or effects-heavy scene. The board must remain easy to read at a glance.
Visual priorities
1. Gameplay readability.
2. Lighting consistency and physical plausibility.
3. Contact shadows and convincing depth.
4. Material definition and surface richness.
5. Atmospheric presentation.
6. Decorative effects.
Every effect must serve one or more of these priorities.

3. LIGHTING SYSTEM
Implement a coherent lighting model appropriate for the existing Canvas renderer.
A. Global illumination and ambient lighting
* Establish a consistent environmental light direction, preferably motivated by sunlight entering the arena.
* Introduce subtle ambient illumination so shaded surfaces retain readable detail.
* Use a coherent warm Roman arena palette, with natural sandstone, muted earth tones, and restrained highlights.
* Add directional variation across arena tiles and environmental surfaces where appropriate.
* Avoid flat, uniformly lit surfaces.
* Avoid excessive contrast that obscures units, terrain, or tactical information.
Approximate global illumination through inexpensive ambient-lighting and color-blending techniques where a full lighting simulation would be unnecessary.
B. Directional lighting
* Define a configurable primary light direction.
* Apply consistent lighting to terrain, arena walls, pillars, units, and environmental objects.
* Use subtle directional highlights to establish form and surface orientation.
* Ensure light and shadow directions remain consistent across all rendered objects.
* Avoid independently generated highlights that contradict the scene's primary light source.
C. Dynamic local lighting
Where appropriate, implement localized illumination for existing gameplay effects such as fire, glowing objects, impacts, or other luminous effects already supported by the game.
* Use restrained falloff and soft edges.
* Avoid excessive bloom, oversized light halos, and neon-like colors.
* Make lighting effects temporally consistent with their associated animations.
* Do not introduce arbitrary light sources simply to make the scene busier.
D. Atmospheric depth
Use subtle techniques to make the arena feel more dimensional without interfering with tactical clarity.
Potential techniques include:
* Gentle distance-based tonal variation.
* Restrained atmospheric haze.
* Subtle separation between arena floor, walls, and background.
* Controlled highlights on important environmental features.
Atmospheric effects must remain secondary to gameplay information and should not reduce contrast around active units or critical tiles.

4. PROFESSIONAL SHADOW SYSTEM
Shadows are a primary focus of this overhaul. Do not settle for adding a generic black ellipse beneath every object.
Implement a layered shadow system using the most appropriate combination of the following techniques.
A. Contact shadows
* Give gladiators, beasts, pillars, and other grounded objects convincing contact with the arena surface.
* Use compact, relatively dark shadows near the point of contact.
* Soften shadow edges progressively away from the contact area.
* Prevent the appearance of objects floating above the board.
* Account for the approximate footprint, orientation, and scale of each object.
B. Cast shadows
* Generate shadows that are consistent with the global light direction.
* Use object dimensions, height estimates, or existing sprite geometry to determine appropriate shadow size and displacement.
* Make taller objects cast longer shadows than low-profile objects where the rendering representation permits.
* Preserve recognizable silhouettes without producing excessively dark or distracting shapes.
* Ensure shadows remain aligned with the isometric projection and tile geometry.
C. Layered shadow softness
Use multiple inexpensive shadow layers when appropriate:
* A compact contact shadow.
* A softer intermediate shadow.
* A broader, lighter cast shadow.
These layers should create a convincing depth gradient without requiring expensive blur operations for every entity on every frame.
D. Environmental shadows
* Improve depth around walls, pillars, architectural structures, and other existing arena objects.
* Add subtle grounding and occlusion where objects meet the floor.
* Avoid seams, dark halos, or inconsistent shadow boundaries between adjacent tiles.
* Ensure the shadow treatment works across the entire board rather than only in the center of the arena.
E. Movement and animation
Shadows must remain visually attached to their objects during movement, attacks, knockbacks, jumps, and other existing animations.
If an object rises or moves away from the ground, its shadow may subtly expand, soften, or become lighter when appropriate.
Do not allow shadows to lag behind moving objects, flicker, jump between tiles, or expose rendering-order problems.

5. MATERIALS, SURFACES, AND VISUAL SEPARATION
Lighting should make existing assets look better, not conceal their weaknesses.
Improve perceived material quality through restrained lighting and shading:
* Sand and arena floor: subtle tonal variation, natural surface irregularity, and soft directional shading.
* Stone and masonry: convincing form, slightly varied illumination, and stronger depth around architectural edges.
* Metal and armor: restrained specular-looking highlights, with no excessive gloss.
* Skin and organic creatures: preserve readable base colors and silhouettes while adding gentle form shading.
* Weapons and shields: improve edge definition, orientation, and separation from overlapping objects.
* Interactive objects: retain their distinctive visual identity while integrating them into the scene's lighting.
Use existing asset colors as the starting point. Do not globally tint everything orange or brown in pursuit of a Roman aesthetic.
Avoid introducing detailed procedural textures or extra geometry unless they provide a meaningful improvement for their cost.

6. RENDERING ARCHITECTURE AND IMPLEMENTATION
Choose techniques based on the actual codebase rather than following a predetermined implementation.
Evaluate options such as:
* Cached shadow sprites or offscreen canvases.
* Reusable gradients and pre-rendered lighting masks.
* Layered transparent shapes.
* Selective Canvas compositing operations.
* Tile-level ambient shading.
* Entity-level contact and cast shadows.
* A separate lighting overlay when appropriate.
Prefer deterministic, reusable rendering calculations over repeated expensive work.
Required engineering practices
1. Separate lighting configuration from rendering logic.
2. Keep shadow generation modular and reusable.
3. Reuse cached resources where their inputs have not changed.
4. Avoid allocating large numbers of temporary objects or canvases inside the main render loop.
5. Avoid repeatedly blurring large areas of the screen.
6. Avoid unnecessary full-screen redraw passes beyond the existing rendering requirements.
7. Respect the game's coordinate transformations, zoom, scaling, and device pixel ratio.
8. Ensure rendering remains correct when the viewport changes size.
9. Keep visual effects independent from authoritative gameplay state.
10. Follow the project's existing coding conventions and use readable, maintainable code.
Do not add a new framework or rendering dependency unless a measurable benefit justifies the additional complexity.
Do not introduce a full WebGL or WebGPU renderer merely to implement effects that can be achieved efficiently with the existing Canvas pipeline.

7. PERFORMANCE REQUIREMENTS
This is a turn-based strategy game. Visual sophistication must not come at the expense of responsive interaction.
Target smooth rendering at 60 FPS on ordinary modern desktop hardware, while recognizing that actual performance depends on the device, browser, canvas resolution, and scene complexity.
Optimize for the real workload, including:
* A fully populated 13×13 arena.
* Multiple gladiators and beasts.
* Overlapping objects and shadows.
* Active attack and movement animations.
* Existing particles and visual effects.
* Resizing and zooming.
* Repeated rounds and prolonged sessions.
Use profiling or measurable frame-time comparisons where available.
Investigate:
* CPU time spent rendering shadows.
* Canvas compositing overhead.
* Cache hit rates and invalidation.
* Garbage collection caused by rendering allocations.
* Memory usage from cached assets.
* Rendering costs at different viewport resolutions.
Prefer graceful degradation over removing essential gameplay visuals. If necessary, scale back expensive blur, atmospheric overlays, or secondary effects before sacrificing contact shadows or unit readability.
Do not claim performance improvements without evidence.

8. VISUAL HIERARCHY AND GAMEPLAY READABILITY
The arena is a tactical board, not a cinematic cutscene.
Lighting must reinforce the player's understanding of the game state.
* Gladiators and beasts must remain easy to distinguish from the terrain.
* Tile boundaries and tactical features must remain legible.
* Active selections, movement ranges, attack ranges, target highlights, and legal actions must retain their intended visual prominence.
* Health indicators, damage feedback, status markers, and other essential UI elements must not be obscured.
* UI panels and text must not accidentally inherit world-space lighting or shadows.
* Shadows must not be confused with selectable objects, terrain hazards, or gameplay markers.
* Effects must not change the perceived location of a unit or tile.
Separate world-space rendering from screen-space interface rendering wherever the current architecture supports it.
The result should make the board easier to interpret, not harder.

9. IMPLEMENTATION WORKFLOW
Work in the following sequence.
Phase 1 — Audit: Inspect the renderer and relevant code. Identify existing functionality that can be reused and the most important visual deficiencies.
Phase 2 — Rendering plan: Choose the smallest coherent set of techniques capable of producing a substantial improvement. Identify affected files and functions, caching strategy, expected performance costs, and potential regressions.
Phase 3 — Foundation: Implement global lighting configuration, consistent light direction, and the shadow primitives needed by the renderer.
Phase 4 — Integration: Integrate the system with terrain, architectural objects, units, and existing animations in the correct rendering order.
Phase 5 — Polish: Refine shadow softness, contact points, ambient shading, material highlights, and atmospheric depth. Keep the effects restrained and cohesive.
Phase 6 — Validation: Run the existing test suite and available browser-based checks. Inspect the actual rendered result at representative zoom levels and viewport sizes. Test the fullest available arena configuration, overlapping entities, movement, combat, selection overlays, UI visibility, and scene resizing.
Phase 7 — Final optimization: Profile the resulting renderer. Remove redundant passes, improve caching, and resolve any measurable performance regressions.
Do not stop after producing a design document or a few demonstration effects. Complete the implementation and verify it.

10. ACCEPTANCE CRITERIA
The overhaul is complete only when:
* The arena has a coherent, intentional lighting direction.
* Grounded objects no longer appear to float because of missing contact shadows.
* Cast shadows reinforce the apparent height, scale, and orientation of objects.
* Lighting and shadows remain consistent across tiles, entities, and structures.
* Existing art looks more dimensional without being stylistically replaced.
* Important units, terrain features, and tactical overlays remain clearly readable.
* Shadows behave correctly during existing movement and combat animations.
* Lighting does not leak into interface elements that should remain unlit.
* Resizing and zooming do not introduce obvious visual artifacts.
* Caching and resource management prevent unnecessary repeated work.
* Existing game mechanics, controls, and save behavior remain intact.
* Existing tests pass, with relevant new checks added where practical.
* Performance has been measured where tooling permits, and any known limitations are documented.
* The implementation is modular, understandable, and maintainable.

11. DELIVERY REPORT
When finished, provide a concise engineering report containing:
1. What changed: the lighting and shadow techniques actually implemented.
2. Files changed: the relevant files and the purpose of each change.
3. Visual impact: the most significant improvements and remaining limitations.
4. Performance: before-and-after measurements when available, including test conditions.
5. Validation: tests executed and their actual results.
6. Trade-offs: any intentional approximations or deferred improvements.
7. Next steps: only the highest-value remaining enhancements.
Distinguish verified results from assumptions. Do not claim that screenshots, tests, or profiling were performed if they were not.

FINAL DIRECTIVE
Approach this as a senior rendering engineer upgrading an existing commercial game, not as an AI adding decorative effects to a canvas.
Prioritize coherent light, convincing shadows, depth, restrained material definition, tactical readability, and measurable performance.
Inspect first. Plan deliberately. Implement the complete solution. Test the actual game. Optimize based on evidence. Preserve everything that already works.
The final result should feel like a meaningful visual upgrade to Flavius Rule, achieved through sophisticated rendering rather than unnecessary engine complexity.
