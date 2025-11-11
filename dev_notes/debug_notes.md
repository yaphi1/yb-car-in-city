# Debug Notes

## Camera
- When traveling south, accelerating or braking makes the camera direction shift
  - x = -0.01, z = 0.999 (actually happens close enough to x:0, z:1)
  - This represents a π or -π rotation from the initial direction
  - What's happening to the camera calculation?

## Wheels jitter when approaching auto-seek target
- As you get closer, the wheel angles are a lot more sensitive to changes
  - So I should increase the angle tolerance as the distance decreases

## Raycast Notes
- Goal: figure out when another car is in front of the current car so that I can change lanes

- Raycast at the other car to see if it's in front
- Need to either do this for all cars or scope it down to a range
- First I need to figure out where to put the raycaster. It applies to a mesh, but that's farther down the component stack, so I need a good place to expose that functionality.
- First I need to get the raycaster working at all.
- I might want to put a collision box around the car.
- Update, I got a test raycaster working by using raycaster.intersectObject(targetObject) instead of trying to use object.raycast() like before
