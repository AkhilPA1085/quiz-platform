import { useEffect, useState } from "react";

export function useDebounce(value:string,delay=300){
    const [debouncedValue,setDebouncedValue] = useState(value)

    useEffect(()=>{
        const timeId = setTimeout(()=>{
            setDebouncedValue(value)
        },delay)

        return ()=>clearTimeout(timeId)
    },[value,delay])

    return debouncedValue
}