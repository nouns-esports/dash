export async function tryCatch<T, E = CustomError>(
    promise: Promise<T>,
): Promise<[T, null] | [null, E]> {
    try {
        const data = await promise;
        return [data, null];
    } catch (error) {
        console.error(error);
        return [null, error as E];
    }
}

export class CustomError extends Error {
    constructor(input: { name: string; message: string }) {
        super(input.message);
        this.name = input.name;
    }
}
