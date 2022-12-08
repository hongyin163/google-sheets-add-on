const baseUrl = "http://localhost:15050/";

type UserInfo = {
  username: string;
  password: string;
};

export const fetchUserInfo = () => {
  return fetch(`${baseUrl}login`, {
    method: "GET",
  }).then((response) => {
    return response.json();
  });
};

export const fetchLogin = (data: UserInfo) => {
  return fetch(`${baseUrl}login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then((response) => {
    return response.json();
  });
};
