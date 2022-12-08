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
  }).then((res)=>{
    if(res.code==0){
        return res.data;
    }
  })
};
