declare const _default: () => {
    port: number;
    database: {
        uri: string;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        password: string;
        from: string;
    };
};
export default _default;
