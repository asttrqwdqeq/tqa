import { useQuery } from "@tanstack/react-query";
import { axiosApi } from "../config/axios";

export const useGet = (url: string, params?: any, options?: any) => {
    return useQuery({
        queryKey: [url],
        queryFn: () => axiosApi.get(url, { params }).then(res => res.data),
        ...options
    })
}