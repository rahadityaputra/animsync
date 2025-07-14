type Collaborator = {
  id: string;
  name: string;
  email: string;
  status: "online" | "offline";
  avatar?: string;
};

export default Collaborator;
