import prisma from "./prismaClient";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export class UserService {

  private static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }


  private static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return computedHash === hash;
  }

  private static generateToken(userId: number, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
    const token = jwt.sign(
      { id_user: userId, email, role },
      secret,
      { expiresIn: "24h" }
    );
    return token;
  }

 
  static async login(email: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      const isValidPassword = this.verifyPassword(password, user.mot_de_passe);
      if (!isValidPassword) {
        throw new Error("Mot de passe incorrect");
      }

      const token = this.generateToken(user.id_user, user.email, user.role);

      return {
        success: true,
        token,
        id_user: user.id_user,
        nom: user.nom,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur d'authentification";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }


  static async createUser(nom: string, email: string, password: string, role: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Cet email existe déjà");
      }

      if (!nom || !email || !password || !role) {
        throw new Error("Tous les champs sont obligatoires");
      }

      const hashedPassword = this.hashPassword(password);

      const newUser = await prisma.user.create({
        data: {
          nom,
          email,
          mot_de_passe: hashedPassword,
          role: role as any,
        },
      });

      return {
        success: true,
        id_user: newUser.id_user,
        nom: newUser.nom,
        email: newUser.email,
        role: newUser.role,
        date_creation: newUser.date_creation,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

 
  static async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id_user: true,
          nom: true,
          email: true,
          role: true,
          date_creation: true,
        },
        orderBy: { date_creation: "desc" },
      });

      return { success: true, users };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur";
      return { success: false, message: errorMessage };
    }
  }


  static async getUserById(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: {
          id_user: true,
          nom: true,
          email: true,
          role: true,
          date_creation: true,
        },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      return { success: true, user };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur";
      return { success: false, message: errorMessage };
    }
  }

  static async updateUser(userId: number, data: { nom?: string; email?: string; role?: string; mot_de_passe?: string }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id_user: userId },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      if (data.email && data.email !== user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        });
        if (existingUser) {
          throw new Error("Cet email existe déjà");
        }
      }

      const updateData: any = {};
      if (data.nom) updateData.nom = data.nom;
      if (data.email) updateData.email = data.email;
      if (data.role) updateData.role = data.role;
      if (data.mot_de_passe) updateData.mot_de_passe = this.hashPassword(data.mot_de_passe);

      const updatedUser = await prisma.user.update({
        where: { id_user: userId },
        data: updateData,
        select: {
          id_user: true,
          nom: true,
          email: true,
          role: true,
          date_creation: true,
        },
      });

      return {
        success: true,
        message: "Utilisateur mis à jour",
        user: updatedUser,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      return { success: false, message: errorMessage };
    }
  }

  static async deleteUser(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id_user: userId },
      });

      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      await prisma.user.delete({
        where: { id_user: userId },
      });

      return {
        success: true,
        message: "Utilisateur supprimé avec succès",
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la suppression";
      return { success: false, message: errorMessage };
    }
  }
}

export default UserService;