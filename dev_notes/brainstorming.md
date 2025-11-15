# Brainstorming


## Auto Brakes

Current car behaviors:
- seek checkpoints
- stay in lane
- if obstacle is in front, change lanes

Issues
- On turns, it can be tricky to tell if a car is ahead since we're not dealing with a straight line.
  - Maybe I can solve this by checking desired velocity instead of velocity. That way I'll know if the future direction is a problem rather than the current one.
- When avoiding an obstacle in the current lane, the car does not check for obstacles in the destination lane.
  - Scenarios:
    - Cars in the destination lane can be ahead, beside, or behind but approaching quickly.
    - If the car can't change lanes or go forwards, then the car must slow down soon enough to avoid hitting the car in front.
- Some cars take turns too fast because they can't auto-brake. Then they veer into the next lane a bit.
