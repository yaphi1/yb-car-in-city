# Debug Notes

## Camera
- When traveling south, accelerating or braking makes the camera direction shift
  - x = -0.01, z = 0.999 (actually happens close enough to x:0, z:1)
  - This represents a π or -π rotation from the initial direction
  - What's happening to the camera calculation?

## Wheels jitter when approaching auto-seek target
- As you get closer, the wheel angles are a lot more sensitive to changes
  - So I should increase the angle tolerance as the distance decreases
