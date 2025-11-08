# **App Name**: Kinetic Curve

## Core Features:

- Bézier Curve Generation: Generates a cubic Bézier curve based on four control points, calculating points along the curve for rendering.
- Dynamic Control Points: Implements dynamic control points (P1 and P2) that respond to device gyroscope data (iOS) or mouse movement (Web), creating an interactive curve.
- Spring-Damping Simulation: Applies a spring-damping model to smooth the motion of the dynamic control points, providing a natural and responsive feel.
- Tangent Vector Computation: Calculates and visualizes tangent vectors along the curve to indicate its direction and curvature at various points.
- Gyroscope Input (iOS): Utilizes CoreMotion on iOS devices to capture gyroscope rotation data (pitch, yaw, roll) and translate it into control point movements.
- Mouse Input (Web): Captures mouse position or drag input on the web to dynamically adjust the positions of the control points.
- Performance Optimization: Optimizes rendering and calculations to maintain a smooth frame rate of at least 60 FPS for interactive and real-time visualization.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) to represent dynamism and interactivity.
- Background color: Light gray (#F0F0F0) to ensure the curve and tangent lines stand out clearly. 
- Accent color: Orange (#F26419) for highlighting control points and tangent lines, creating a visually engaging experience.
- Body and headline font: 'Inter' sans-serif for a modern, machined, objective, neutral look; suitable for interactive applications. 
- Minimalist icons for interactive controls (if any), such as start/stop simulation.  
- Clean, uncluttered layout with the Bézier curve as the central focus, ensuring an intuitive user experience.
- Smooth, fluid animations for control point movement and tangent line updates, enhancing the sense of realism.