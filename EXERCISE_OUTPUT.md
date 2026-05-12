# API Response Documentation & Exercise Definitions

## 🎥 Demonstration

<div align="center">

  

https://github.com/user-attachments/assets/6cde6456-6c7c-49bf-a7a2-8c6f91a38499


  <p><i>Real-time exercise detection and joint angle tracking.</i></p>
</div>

---

## 🏃 Pose Definitions & Ranges

To ensure accuracy, the engine validates movements based on specific target poses. Below are the visual definitions for each pose and their acceptable joint angle ranges.

### Pose 1: Starting Position
<div align="center">
  <img src="img/pose-1.jpg" width="450" alt="Pose 1 Definition">
  <p><b>Acceptable Range:</b> Joint angles must be within the highlighted zones to trigger the "In Pose" state. This represents the starting position of the movement.</p>
</div>

### Pose 2: Target Position
<div align="center">
  <img src="img/pose-2.jpg" width="450" alt="Pose 2 Definition">
  <p><b>Acceptable Range:</b> This pose represents the peak of the movement. Full range of motion is required to validate the repetition. Joint angles must reach the designated threshold.</p>
</div>

---

## Overview
This API response provides a structured JSON object containing data related to **Body Pose** detection, joint angles, and their corresponding timing. The system monitors the user's physical orientation and movements to categorize them into cycles and continuous timelines.

### Key Concepts
* **Body Pose**: The specific orientation or position of the user's body limbs and torso at a given moment, recognized by the detection engine.

---

## Root Object
The root response consists of two main arrays:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `cycles` | Array of Objects | A list of movement cycles. Each cycle includes start/end times and a collection of specific poses. |
| `timelines` | Array of Objects | A continuous temporal stream of events, including recognized poses and "gap" periods. |

---

## 1. Cycles Object
Each item in the `cycles` array represents a general time frame containing recognized physical movements.

* **Cycle**: A complete set of movements or a single repetition of an exercise, beginning from the first recognized pose and ending at the conclusion of the last pose in that sequence.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `from` | Number (Timestamp) | The start time of the cycle in Unix Timestamp format (milliseconds). |
| `to` | Number (Timestamp) | The end time of the cycle in Unix Timestamp format (milliseconds). |
| `poses` | Array of Objects | An array of specific recognized positions performed during this cycle. |

### Poses Sub-Object (Within Cycles)
* **Poses**: These are discrete, predefined target positions that a user must reach to complete parts of a cycle (e.g., the "up" or "down" position of a squat).

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique identifier for this specific pose occurrence. |
| `from` / `to` | Number | Precise start and end timestamps for this pose. |
| `poseId` | String (UUID) | Reference ID for the type of pose. |
| `poseName` | String | The human-readable name of the pose (e.g., "pose 1"). |
| `angles` | Object | Numerical values representing the joint angles measured during this pose. |

---

## 2. Timelines Object
The `timelines` section represents a continuous sequence of time segments.

### Pose vs. Gap
In the timeline, every segment is classified into one of two states:
* **In Pose**: The user is currently maintaining a recognized target position.
* **In Gap**: The transition period between two poses. A "Gap" represents the movement or "travel time" where the user has left one pose but has not yet reached the next recognized one.

| Field Name | Data Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Required | Unique identifier for this timeline segment. |
| `from` / `to` | Number | Required | Start and end timestamps for the segment. |
| `poseId` / `poseName` | String | Optional | Populated if the segment is a **Pose**. Null/Empty if the segment is a **Gap**. |
| `angles` | Object | Required | Continuous recording of angles, providing data during both poses and gaps. |

---

## Joint Angles Object (angles)
* **Joint Angles**: The relative angle (measured in degrees) between two connected body segments (e.g., the angle at the elbow or shoulder), used to verify the correctness of a pose.

| Field Name (Example) | Data Type | Description |
| :--- | :--- | :--- |
| `Left Shoulder` | Number | Measured angle of the left shoulder joint. |
| `Left Elbow` | Number | Measured angle of the left elbow joint. |

---

## Payload Example

```json
{
  "cycles": [
    {
      "from": 1777973693647,
      "poses": [
        {
          "id": "c4f52695-b903-4ace-8737-7e60cd3814be",
          "from": 1777973693647,
          "to": 1777973694708,
          "poseId": "b063148e-1050-4be0-af04-60a6c3420844",
          "poseName": "pose 1",
          "angles": {
            "Left Shoulder": 20,
            "Left Elbow": 26
          },
          "conditionPoses": []
        }
      ],
      "to": 1777973698918
    }
  ],
  "timelines": [
    {
      "id": "dd175807-68ab-4c51-b6c5-8e0c7d08e6f0",
      "from": 1777973688163,
      "to": 1777973689026,
      "angles": {
        "Left Shoulder": 60,
        "Left Elbow": 16
      }
    }
  ]
}
