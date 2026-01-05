import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
	Box,
	Card,
	CardContent,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
	Stack,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import { networkService } from "../../../../../../main.jsx";

const DockerTab = ({ monitorId }) => {
	const [dockerData, setDockerData] = useState(null);
	const [loading, setLoading] = useState(true);
	const theme = useTheme();
	const { t } = useTranslation();

	useEffect(() => {
		fetchDockerData();
		// Poll every 15 seconds for updates
		const interval = setInterval(fetchDockerData, 15000);
		return () => clearInterval(interval);
	}, [monitorId]);

	const fetchDockerData = async () => {
		try {
			const response = await networkService.get({
				endpoint: `/monitors/hardware/docker/${monitorId}`,
			});
			if (response.data.success && response.data.data.length > 0) {
				setDockerData(response.data.data[0].docker);
			} else {
				setDockerData(null);
			}
		} catch (error) {
			console.error("Error fetching Docker data:", error);
			setDockerData(null);
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "running":
				return "success";
			case "exited":
			case "stopped":
				return "error";
			case "paused":
				return "warning";
			default:
				return "default";
		}
	};

	const formatTimestamp = (timestamp) => {
		if (!timestamp) return "N/A";
		return new Date(timestamp * 1000).toLocaleString();
	};

	if (loading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				p={4}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!dockerData || !dockerData.data || dockerData.data.length === 0) {
		return (
			<Box p={4}>
				<Typography
					variant="body1"
					color="text.secondary"
				>
					{t("v1.infrastructure.noDockerContainers")}
				</Typography>
				<Typography
					variant="body2"
					color="text.secondary"
					mt={1}
				>
					{t("v1.infrastructure.dockerSocketHelp")}
				</Typography>
			</Box>
		);
	}

	const containers = dockerData.data || [];
	const runningContainers = containers.filter((c) => c.running).length;
	const stoppedContainers = containers.length - runningContainers;

	return (
		<Stack gap={theme.spacing(4)}>
			{/* Summary Cards */}
			<Box
				display="flex"
				gap={theme.spacing(4)}
			>
				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							variant="h6"
							color={theme.palette.text.primary}
						>
							{containers.length}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							{t("v1.infrastructure.totalContainers")}
						</Typography>
					</CardContent>
				</Card>

				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							variant="h6"
							color="success.main"
						>
							{runningContainers}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							{t("v1.infrastructure.runningContainers")}
						</Typography>
					</CardContent>
				</Card>

				<Card sx={{ flex: 1 }}>
					<CardContent>
						<Typography
							variant="h6"
							color="error.main"
						>
							{stoppedContainers}
						</Typography>
						<Typography
							variant="body2"
							color="text.secondary"
						>
							{t("v1.infrastructure.stoppedContainers")}
						</Typography>
					</CardContent>
				</Card>
			</Box>

			{/* Containers Table */}
			<TableContainer component={Card}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>{t("v1.infrastructure.containerName")}</TableCell>
							<TableCell>{t("v1.infrastructure.image")}</TableCell>
							<TableCell>{t("v1.infrastructure.status")}</TableCell>
							<TableCell>{t("v1.infrastructure.health")}</TableCell>
							<TableCell>{t("v1.infrastructure.ports")}</TableCell>
							<TableCell>{t("v1.infrastructure.started")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{containers.map((container) => (
							<TableRow key={container.container_id}>
								<TableCell>
									<Typography
										variant="body2"
										fontWeight="medium"
									>
										{container.container_name || "Unknown"}
									</Typography>
									<Typography
										variant="caption"
										color="text.secondary"
									>
										{container.container_id?.substring(0, 12)}
									</Typography>
								</TableCell>

								<TableCell>
									<Typography
										variant="body2"
										noWrap
									>
										{container.base_image}
									</Typography>
								</TableCell>

								<TableCell>
									<Chip
										label={container.status || "unknown"}
										color={getStatusColor(container.status)}
										size="small"
									/>
								</TableCell>

								<TableCell>
									{container.health ? (
										<Box>
											<Chip
												label={container.health.healthy ? "Healthy" : "Unhealthy"}
												color={container.health.healthy ? "success" : "error"}
												size="small"
											/>
											<Typography
												variant="caption"
												display="block"
												color="text.secondary"
												mt={0.5}
											>
												{container.health.source}
											</Typography>
										</Box>
									) : (
										<Typography
											variant="caption"
											color="text.secondary"
										>
											N/A
										</Typography>
									)}
								</TableCell>

								<TableCell>
									{container.exposed_ports && container.exposed_ports.length > 0 ? (
										container.exposed_ports.map((port, idx) => (
											<Typography
												key={idx}
												variant="caption"
												display="block"
											>
												{port.port}/{port.protocol}
											</Typography>
										))
									) : (
										<Typography
											variant="caption"
											color="text.secondary"
										>
											{t("v1.infrastructure.noPorts")}
										</Typography>
									)}
								</TableCell>

								<TableCell>
									<Typography variant="body2">{formatTimestamp(container.started_at)}</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</Stack>
	);
};

DockerTab.propTypes = {
	monitorId: PropTypes.string.isRequired,
};

export default DockerTab;
