import { usePathname, useRouter, useSearchParams } from "next/navigation";
interface SearchParam {
    name: string;
    value: string;
}
const useCreateSearchQuery = () => {
    const { push } = useRouter();

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const newParams = new URLSearchParams(searchParams);
    
    const createSearchParams = ({
        param,
        url,
        replaceUrl = false,
    }: {
        param: SearchParam | SearchParam[];
        url?: string;
        replaceUrl?: boolean;
    }) => {
        if (Array.isArray(param)) {
            param.forEach((p) => {
                newParams.set(p.name, p.value);
            });
        } else {
            newParams.set(param.name, param.value);
        }
        // Update URL without page reload using replaceState or pushState
        const method = replaceUrl ? "replaceState" : "pushState";
        if (url) {
            push(`${url}?${newParams.toString()}`);
        } else {
            window.history[method]({}, "", `${pathname}?${newParams.toString()}`);
        }
    };
    const deleteSearchParams = ({ name }: { name: string }) => {
        newParams.delete(name);
        window.history.replaceState({}, "", `${pathname}?${newParams.toString()}`);
    };
    return { searchParams: searchParams, createSearchParams, deleteSearchParams };
};
export default useCreateSearchQuery;
