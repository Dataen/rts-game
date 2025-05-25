import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Typography, Stack } from "@mui/material";
import { format } from "date-fns";
import type { Match } from '../types/Match';
import { useNavigate } from "react-router";
import { BotAvatar } from "./BotAvatar";
import { UserAvatar } from "./UserAvatar";
import { FaCheckCircle } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";



export function MatchTable({ matches }: { matches: Match[] }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead sx={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
                    <TableRow>
                        <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Bot A</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Bot B</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Started By</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {matches.map(match => (
                        <MatchRow key={match.uuid} match={match} />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function MatchRow({ match }: { match: Match }) {
    const navigate = useNavigate();

    return (
        <TableRow
            onClick={() => {
                navigate(`/matches/${match.uuid}`);
            }}
            sx={{
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#3f51b5' },
                color: 'inherit',
            }}
        >
            <TableCell>
                {match.finishedAt
                    ? <Stack direction="row" spacing={1}>
                        <FaCheckCircle size={26} color="success" />
                        <Typography>Done</Typography>
                    </Stack>
                    : <Stack direction="row" spacing={1}>
                        <CircularProgress size={26} />
                        <Typography>Running</Typography>
                    </Stack>}
            </TableCell>
            <TableCell>{match.botAUuid ? <BotAvatar id={match.botAUuid} /> : '-'}</TableCell>
            <TableCell>{match.botBUuid ? <BotAvatar id={match.botBUuid} /> : '-'}</TableCell>
            <TableCell>
                {match.userId ? <UserAvatar id={match.userId} /> : '-'}
            </TableCell>
        </TableRow>
    );
}
