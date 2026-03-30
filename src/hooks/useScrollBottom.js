import {useLayoutEffect, useRef} from "react";


export function useScrollBottom(dependency) {
    const scrollRef = useRef(null);

    useLayoutEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [dependency]);

    return scrollRef;
}
















