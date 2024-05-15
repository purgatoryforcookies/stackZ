

export class DockerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DockerError';
    }
}