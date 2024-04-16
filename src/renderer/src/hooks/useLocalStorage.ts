

function useLocalStorage() {

    const read = (key: string) => {
        const item = localStorage.getItem(key);
        return item
    }


    const write = (key: string, value: string) => {
        localStorage.setItem(key, value);
    }

    return { read, write }

}

export default useLocalStorage