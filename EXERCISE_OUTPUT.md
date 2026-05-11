# API Response Documentation

## Overview
This API response provides a structured JSON object containing data related to body pose detection, joint angles, and their corresponding timing. The data is organized into two primary sections: `cycles` and `timelines`.

---

## Root Object
The root response consists of two main arrays:

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `cycles` | Array of Objects | A list of movement cycles. Each cycle includes start/end times and a collection of specific poses. |
| `timelines` | Array of Objects | A continuous temporal stream of events, including recognized poses and "gap" periods (transitions between poses). |

---

## 1. Cycles Object
Each item in the `cycles` array represents a general time frame containing recognized physical movements.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `from` | Number (Timestamp) | The start time of the cycle in Unix Timestamp format (milliseconds). |
| `to` | Number (Timestamp) | The end time of the cycle in Unix Timestamp format (milliseconds). |
| `poses` | Array of Objects | An array of specific Poses performed during this cycle. |

### Poses Sub-Object (Within Cycles)
| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | String (UUID) | Unique identifier for this specific pose occurrence. |
| `from` / `to` | Number | Precise start and end timestamps for this pose. |
| `poseId` | String (UUID) | Reference ID for the type of pose (e.g., specific ID for "Pose 1"). |
| `poseName` | String | The human-readable name of the pose (e.g., "pose 1"). |
| `angels` | Object | An object containing joint angles measured during the pose. |
| `conditionPoses` | Array | An array of conditional states or sub-poses (if applicable). |

---

## 2. Timelines Object
The `timelines` section represents a continuous sequence of time segments, covering both recognized poses and the intervals (gaps) between them.

| Field Name | Data Type | Status | Description |
| :--- | :--- | :--- | :--- |
| `id` | String (UUID) | Required | Unique identifier for this timeline segment. |
| `from` / `to` | Number | Required | Start and end timestamps for the segment. |
| `poseId` / `poseName` | String | Optional | Only populated when the system detects a valid pose. Remains null during gaps. |
| `angels` | Object | Required | Recorded joint angles (calculated continuously, even during transitions/gaps). |

---

## Joint Angles Object (Angels)
This object maps specific body parts to their measured angles in degrees.

| Field Name (Example) | Data Type | Description |
| :--- | :--- | :--- |
| `Left Shoulder` | Number | Measured angle of the left shoulder joint. |
| `Left Elbow` | Number | Measured angle of the left elbow joint. |

> **Note:** Depending on the system configuration, this object may include other joints such as `Right Shoulder`, `Knees`, etc.

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
          "angels": {
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
      "angels": {
        "Left Shoulder": 60,
        "Left Elbow": 16
      }
    }
  ]
}
