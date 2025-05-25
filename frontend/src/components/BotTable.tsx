import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { format } from "date-fns";
import type { Bot } from '../types/Bot';
import { useNavigate } from "react-router";
import { LanguageIcon } from "./LanguageIcon";
import { UserAvatar } from "./UserAvatar";

export function BotTable({ bots }: { bots: Bot[] }) {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead sx={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
                    <TableRow>
                        <TableCell sx={{ color: '#fff' }}>Name</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Language</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Rating</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Creator</TableCell>
                        <TableCell sx={{ color: '#fff' }}>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {bots.map(bot => <BotRow key={bot.id} bot={bot} />)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

function BotRow({ bot }: { bot: Bot }) {
    const navigate = useNavigate()

    return (
        <TableRow
            onClick={() => {
                navigate(`/bots/${bot.id}`)
            }}
            sx={{
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#3f51b5' },
                color: 'inherit',
            }}
        >
            <TableCell>{bot.name}</TableCell>
            <TableCell><LanguageIcon lang={bot.language} /></TableCell>
            <TableCell>{bot.rating.toFixed(1)}</TableCell>
            <TableCell><UserAvatar id={bot.userId} /></TableCell>
            <TableCell>{format(new Date(bot.creationDate), "yyyy-MM-dd HH:mm:ss")}</TableCell>
        </TableRow>
    );
}

