import express from "express";
import axios from "axios";
import { to } from "await-to-js";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// --------------------------------------------------
// Get user exercises (render page)
// --------------------------------------------------
router.get("/get-my-exercises", async (req, res) => {
  let error: string | null = null;

  if (!req.user) {
    return res.render("login", {
      title: "Login",
      error: null,
      userDefault: process.env.DEFAULT_USER || "",
      userPass: process.env.DEFAULT_PASS || "",
    });
  }

  const {
    label,
    posture,
    camera,
    exerciseType,
    targetJoint,
    pushTimelineMode,
    limit = 12,
    offset = 0,
  } = req.query as Record<string, any>;
console.log("Received query params:", req.query);
console.log("Parsed query params:", {
  label,
  posture,
  camera,
  exerciseType,
  targetJoint,
  pushTimelineMode,
  limit,
  offset,
});
  // =========================
  // Build clean params
  // =========================
  const params: Record<string, any> = {
    limit: Number(limit),
    offset: Number(offset),
  };

  const addIfValid = (key: string, value: any) => {
    if (value !== undefined && value !== null) {
      const v = String(value).trim();
      if (v !== "") params[key] = v;
    }
  };

  addIfValid("label", label);
  addIfValid("posture", posture);
  addIfValid("camera", camera);
  addIfValid("exerciseType", exerciseType);
  addIfValid("targetJoint", targetJoint);
  addIfValid("pushTimelineMode", pushTimelineMode);
  console.log("Exercise Filters =>", params);
  // =========================
  // API Call
  // =========================
  const [err, response] = await to(
    axios.get(process.env.API_GET_MY_EXERCISES!, {
      params,
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN_EXECUTE}`,
      },
    })
  );

  if (err) {
    error = "Failed to fetch exercises.";
    console.error(err);
  }

  if (response?.data?.error) {
    error = response.data.error;
  }

  // =========================
  // Render (send query back!)
  // =========================
  return res.render("index", {
    title: "Home",
    error,
    user: req.user,
    response: response?.data?.results || [],
    query: req.query,
  });
});

// --------------------------------------------------
// Get exercises (API endpoint)
// --------------------------------------------------
// --------------------------------------------------
// Get exercises (API endpoint)
// --------------------------------------------------
router.post("/get-my-exercises", async (req, res) => {

  try {

    // =========================
    // Queries From Frontend
    // =========================

    const {
      limit = 10,
      offset = 0,
      search,
      posture,
      camera,
      type,
      joint,
      timeline
    } = req.query;

    // =========================
    // Dynamic Params
    // =========================

    const params: any = {
      limit,
      offset
    };

    // append only filled values

    if (search) {
      params.label = search;
    }

    if (posture) {
      params.posture = posture;
    }

    if (camera) {
      params.camera = camera;
    }

    if (type) {
      params.exerciseType = type;
    }

    if (joint) {
      params.targetJoint = joint;
    }

    if (timeline) {
      params.pushTimelineMode = timeline;
    }

    console.log("Exercise Filters =>", params);

    // =========================
    // API Request
    // =========================

    const [err, response] = await to(
      axios.get(
        process.env.API_GET_MY_EXERCISES!,
        {
          params,
          headers: {
            Authorization:
              `Bearer ${process.env.ACCESS_TOKEN_EXECUTE}`,
          },
        }
      )
    );

    // =========================
    // Error Handling
    // =========================

    if (err) {

      console.error(
        "Fetch exercises failed:",
        err
      );

      return res.status(400).json({
        error: "Failed to fetch exercises",
      });

    }

    // =========================
    // API Error
    // =========================

    if (response?.data?.error) {

      return res.status(400).json({
        error: response.data.error
      });

    }

    // =========================
    // Success
    // =========================

    return res.json({
      success: true,
      results:
        response?.data?.results || [],
      total:
        response?.data?.total || 0
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      error: "Internal server error"
    });

  }

});

// --------------------------------------------------
// Redirect to execute exercise
// --------------------------------------------------
router.get("/execute/:key", (req, res) => {
  const exerciseKey = req.params.key;

  if (!exerciseKey) {
    return res.status(400).send("Missing exerciseKey");
  }

  const baseUrl = process.env.API_REDIRECT_EXECUTE_EXERCISE!;
  const targetUrl = baseUrl.replace("{exerciseKey}", exerciseKey);


  const url = new URL(targetUrl);

  url.searchParams.set("metadata", exerciseKey);

  Object.entries(req.query).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  url.searchParams.set("token", process.env.ACCESS_TOKEN_EXECUTE!);

  return res.redirect(307, url.toString());
});

// --------------------------------------------------
// Redirect to create exercise
// --------------------------------------------------
router.get("/create/:metadata", (req, res) => {
  const baseUrl = process.env.API_REDIRECT_CREATE_EXERCISE!;
  const token = process.env.ACCESS_TOKEN_EXECUTE!;

  const url = new URL(baseUrl);

  // Attach query parameters
  url.searchParams.set("token", token);
  url.searchParams.set("metadata", req.params.metadata);

  return res.redirect(307, url.toString());
});

// --------------------------------------------------
// Redirect to modify exercise
// --------------------------------------------------
router.get("/modify/:exerciseKey/:metadata", (req, res) => {
  const baseUrl = process.env.API_REDIRECT_MODIFY_EXERCISE!;
  const token = process.env.ACCESS_TOKEN_MODIFY!;

  const finalUrl = baseUrl.replace("{exerciseKey}", req.params.exerciseKey);
  const url = new URL(finalUrl);

  // Attach query parameters
  url.searchParams.set("token", token);
  
  url.searchParams.set("metadata", req.params.metadata);
    Object.entries(req.query).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return res.redirect(307, url.toString());
});

// --------------------------------------------------
// Fetch exercise image
// --------------------------------------------------
router.get("/exercise-image/:key", async (req, res) => {
  const exerciseKey = req.params.key;

  if (!exerciseKey) {
    return res.status(400).send("Missing exerciseKey");
  }

  const baseUrl = process.env.API_GET_EXERCISE_IMAGE!;
  const targetUrl = baseUrl.replace("{exerciseKey}", exerciseKey);
  const finalUrl = targetUrl.replace("{poseId}", "1");

  try {
    const response = await axios.get(finalUrl, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN_EXECUTE}`,
      },
      responseType: "arraybuffer",
    });

    // Set correct content type for image
    res.setHeader("Content-Type", "image/png");

    return res.send(response.data);
  } catch (err) {
    console.error("Image fetch failed:", err);

    return res.status(500).send("Failed to fetch exercise image");
  }
});
router.get("/exercise-video/:key", async (req, res) => {
  const exerciseKey = req.params.key;

  if (!exerciseKey) {
    return res.status(400).send("Missing exerciseKey");
  }

  const baseUrl = process.env.API_GET_EXERCISE_VIDEO!;
  const targetUrl = baseUrl.replace("{exerciseKey}", exerciseKey);

  try {
    const response = await axios.get(targetUrl, {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN_EXECUTE}`,
      },
      responseType: "arraybuffer",
    });

    console.log("response:", response);
    // Set correct content type for video
    res.setHeader("Content-Type", "video/webm");

    return res.send(response.data);
  } catch (err) {
    console.error("Image fetch failed:", err);

    return res.status(500).send("Failed to fetch exercise image");
  }
});

export default router;