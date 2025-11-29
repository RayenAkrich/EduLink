import { Request, Response } from "express";
import UserService from "../services/userService";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const result = await UserService.getAllUsers();
    if (result.success) {
      res.json({ success: true, users: result.users });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const { nom, email, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe || !role) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires",
      });
    }

    const result = await UserService.createUser(nom, email, mot_de_passe, role);
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const id_user = Number(req.params.id);
    const { nom, email, role, mot_de_passe } = req.body;

    if (isNaN(id_user)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide",
      });
    }

    const result = await UserService.updateUser(id_user, {
      nom,
      email,
      role,
      mot_de_passe,
    });

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Accès refusé" });
    }

    const id_user = Number(req.params.id);

    if (isNaN(id_user)) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur invalide",
      });
    }

    const result = await UserService.deleteUser(id_user);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};