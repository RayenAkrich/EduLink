import prisma from "./prismaClient";
import jwt from "jsonwebtoken";

// Pour le hachage, on peut utiliser crypto natif ou bcrypt
// Ici on utilise crypto natif pour éviter dépendances supplémentaires
import crypto from "crypto";

export class UserService {
  /**
   * Hache un mot de passe avec un salt
   */
  private static hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return `${salt}:${hash}`;
  }

  /**
   * Vérifie un mot de passe contre un hash
   */
  private static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");
    return computedHash === hash;
  }

  /**
   * Génère un JWT token
   */
  private static generateToken(userId: number, email: string, role: string): string {
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-prod";
    const token = jwt.sign(
      { id_user: userId, email, role },
      secret,
      { expiresIn: "24h" }
    );
    return token;
  }

  /**
   * Authentifie un utilisateur avec email + password
   */
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

  /**
   * Crée un nouvel utilisateur (admin only)
   */
  static async createUser(nom: string, email: string, password: string, role: string) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Cet email existe déjà");
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
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur lors de la création";
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * Récupère un utilisateur par ID
   */
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
}

export default UserService;
