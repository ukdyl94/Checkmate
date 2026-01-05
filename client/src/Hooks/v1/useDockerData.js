import { useEffect, useState, useRef } from "react";
import { networkService } from "../../main.jsx";

const useDockerData = ({ monitorId }) => {
	const [dockerData, setDockerData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const isInitialLoad = useRef(true);

	useEffect(() => {
		let isMounted = true;

		const fetchDockerData = async () => {
			if (!monitorId) return;

			try {
				// Only show loading spinner on initial load, not on polling updates
				if (isInitialLoad.current) {
					setIsLoading(true);
				}
				setError(null);

				const response = await networkService.getDockerDataById({
					monitorId,
				});

				if (isMounted) {
					if (response.data.success && response.data.data.length > 0) {
						setDockerData(response.data.data[0].docker);
					} else {
						setDockerData(null);
					}
				}
			} catch (err) {
				console.error("Error fetching Docker data:", err);
				if (isMounted) {
					setError(err);
					setDockerData(null);
				}
			} finally {
				if (isMounted && isInitialLoad.current) {
					setIsLoading(false);
					isInitialLoad.current = false;
				}
			}
		};

		fetchDockerData();

		// Poll every 15 seconds for updates
		const interval = setInterval(fetchDockerData, 15000);

		return () => {
			isMounted = false;
			clearInterval(interval);
		};
	}, [monitorId]);

	return { dockerData, isLoading, error };
};

export default useDockerData;
