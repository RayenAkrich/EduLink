import axios from "axios";

const API = "http://localhost:5000/messages";

export const sendMessage = async (token: string, destinataire_id: number, contenu: string) => {
  return axios.post(API + "/send", {
    destinataire_id,
    contenu
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getConversation = async (token: string, otherId: number) => {
  return axios.get(API + `/conversation/${otherId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const getConversationsList = async (token: string) => {
  return axios.get(API + "/list", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const markAsRead = async (token: string, otherId: number) => {
  return axios.patch(API + "/read", {
    otherId
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
