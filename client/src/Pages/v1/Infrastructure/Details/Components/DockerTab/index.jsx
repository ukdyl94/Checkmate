import PropTypes from "prop-types";
import {
	Box,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Chip,
	CircularProgress,
	Paper,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useTranslation } from "react-i18next";
import useDockerData from "../../../../../../Hooks/v1/useDockerData.js";
import StatusBoxes from "@/Components/v1/StatusBoxes/index.jsx";
import StatBox from "@/Components/v1/StatBox/index.jsx";

const DockerTab = ({ monitorId }) => {
	const theme = useTheme();
	const { t } = useTranslation();
	const { dockerData, isLoading: loading } = useDockerData({ monitorId });

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
		<>
			{/* Summary Cards */}
			<StatusBoxes shouldRender={true}>
				<StatBox
					heading={t("v1.infrastructure.totalContainers")}
					subHeading={containers.length.toString()}
				/>
				<StatBox
					heading={t("v1.infrastructure.runningContainers")}
					subHeading={runningContainers.toString()}
				/>
				<StatBox
					heading={t("v1.infrastructure.stoppedContainers")}
					subHeading={stoppedContainers.toString()}
				/>
			</StatusBoxes>

			{/* Containers Table */}
			<TableContainer
				component={Paper}
				sx={{
					background: `linear-gradient(340deg, ${theme.palette.tertiary.main} 10%, ${theme.palette.primary.main} 45%)`,
					borderRadius: 4,
					border: 1,
					borderColor: theme.palette.primary.lowContrast,
					marginTop: theme.spacing(8),
				}}
			>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.containerName")}
							</TableCell>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.image")}
							</TableCell>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.status")}
							</TableCell>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.health")}
							</TableCell>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.ports")}
							</TableCell>
							<TableCell
								sx={{
									color: theme.palette.primary.contrastTextSecondary,
									borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
								}}
							>
								{t("v1.infrastructure.started")}
							</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{containers.map((container) => (
							<TableRow key={container.container_id}>
								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
									<Typography
										variant="body2"
										fontWeight="medium"
										sx={{ color: theme.palette.primary.contrastText }}
									>
										{container.container_name || "Unknown"}
									</Typography>
									<Typography
										variant="caption"
										sx={{ color: theme.palette.primary.contrastTextTertiary }}
									>
										{container.container_id?.substring(0, 12)}
									</Typography>
								</TableCell>

								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
									<Typography
										variant="body2"
										noWrap
										sx={{ color: theme.palette.primary.contrastText }}
									>
										{container.base_image}
									</Typography>
								</TableCell>

								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
									<Chip
										label={container.status || "unknown"}
										color={getStatusColor(container.status)}
										size="small"
									/>
								</TableCell>

								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
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
												sx={{ color: theme.palette.primary.contrastTextTertiary }}
												mt={0.5}
											>
												{container.health.source}
											</Typography>
										</Box>
									) : (
										<Typography
											variant="caption"
											sx={{ color: theme.palette.primary.contrastTextTertiary }}
										>
											N/A
										</Typography>
									)}
								</TableCell>

								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
									{container.exposed_ports && container.exposed_ports.length > 0 ? (
										container.exposed_ports.map((port, idx) => (
											<Typography
												key={idx}
												variant="caption"
												display="block"
												sx={{ color: theme.palette.primary.contrastText }}
											>
												{port.port}/{port.protocol}
											</Typography>
										))
									) : (
										<Typography
											variant="caption"
											sx={{ color: theme.palette.primary.contrastTextTertiary }}
										>
											{t("v1.infrastructure.noPorts")}
										</Typography>
									)}
								</TableCell>

								<TableCell
									sx={{
										color: theme.palette.primary.contrastText,
										borderBottom: `1px solid ${theme.palette.primary.lowContrast}`,
									}}
								>
									<Typography
										variant="body2"
										sx={{ color: theme.palette.primary.contrastText }}
									>
										{formatTimestamp(container.started_at)}
									</Typography>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};

DockerTab.propTypes = {
	monitorId: PropTypes.string.isRequired,
};

export default DockerTab;
