import express, { Router } from "express";
import UserService from "../services/userService";
import { authMiddleware } from "../middleware/authMiddleware";

export const authRoutes = Router();

/**
 * POST /api/auth/login
 * Authentifie un utilisateur
 * Body: { email: string, password: string }
 */
authRoutes.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email et mot de passe requis",
      });
    }

    const result = await UserService.login(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

/**
 * POST /api/auth/register
 * Crée un nouvel utilisateur (admin seulement)
 * Headers: Authorization: Bearer <token>
 * Body: { nom: string, email: string, password: string, role: string }
 */
authRoutes.post("/register", authMiddleware, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Seuls les admins peuvent créer des utilisateurs",
      });
    }

    const { nom, email, password, role } = req.body;

    if (!nom || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis",
      });
    }

    const result = await UserService.createUser(nom, email, password, role);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

/**
 * GET /api/auth/me
 * Récupère les infos de l'utilisateur connecté
 * Headers: Authorization: Bearer <token>
 */
authRoutes.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id_user) {
      return res.status(401).json({
        success: false,
        message: "Non authentifié",
      });
    }

    const result = await UserService.getUserById(req.user.id_user);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur";
    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});

export default authRoutes;
