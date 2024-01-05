export type PgClientOptions = {
    db: string,
    username: string,
    password: string
    host?: string,
    port?: number,
    publications?: string
}

export type WebSocketOptions = {
    port: number;
    connectionTimeout?: number
    trace: "trace" | "prod"
}