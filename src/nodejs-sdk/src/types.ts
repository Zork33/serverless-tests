export interface TokenService {
    getToken: () => Promise<string>;
    destroy?: () => void;
}
