const baseUrl = "http://localhost:15050/";

export type UserInfo = {
    username: string;
    password: string;
};

export const fetchUserInfo = (): Promise<UserInfo> => {
    return fetch(`${baseUrl}login`, {
        method: "GET",
    }).then((res) => {
        return res.json();
    }).then((res) => {
        if (res.code === 0) {
            return res.data;
        }else{
            throw new Error(res.message);
        }
    })
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
