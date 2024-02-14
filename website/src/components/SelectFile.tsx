import { RouterOutput, trpc } from "@/lib/trpc"
import React, { useEffect, useState } from "react"
import { DataTable } from "mantine-datatable"
import { Box } from "@mantine/core"
import { useRouter } from "next/router"

interface SelectFileProps {
    isLoading: boolean
    onSelect: (id: string[]) => void
}

export function SelectFile({ isLoading, onSelect }: SelectFileProps) {
    const router = useRouter()
    const [page, setPage] = useState<number>(1)
    const files = trpc.files.getFiles.useQuery({
        page,
        course: router.query.course as string,
    })
    const [selected, setSelected] = useState<
        RouterOutput["files"]["getFiles"]["files"][number][]
    >([])

    useEffect(
        function () {
            let ids: string[] = [];
            for (let i = 0; i < selected.length; ++i)
            {
                ids[i] = selected.at(i)!.id;
            }


            onSelect(ids)
        },
        [onSelect, selected],
    )
    const max_selected = 5;

    return (
        <Box bg="dark.8">
            {/* {typeof window !== "undefined" && ( */}
            <DataTable
                // records={files.data?.files}
                records={
                        files.data?.files
                }
                fetching={files.isFetching}
                selectedRecords={selected}
                onSelectedRecordsChange={(records) => {
                    if (records.length > max_selected)
                    {
                        setSelected(records.slice(0, 5));
                    }
                    else
                    {
                        setSelected(records);
                    }
                }}
                loadingText="Loading documents"
                noRecordsText="Found no documents"
                recordsPerPage={files.data?.docsPerPage ?? 5}
                totalRecords={files.data?.docs ?? 0}
                minHeight={256}
                onPageChange={(page) => setPage(page)}
                page={page}
                isRecordSelectable={(record) => {
                    if (selected.length >= max_selected) {
                        for (let i = 0; i < selected.length; ++i)
                        {
                            if (selected.at(i)!.id === record.id)
                            {
                                return true;
                            }
                        }
                    }
                    else
                    {
                        return true;
                    }
                    return false;
                }}
                columns={[
                    { accessor: "filename" },
                    {
                        accessor: "id",
                        // hidden: true,
                        cellsStyle: {
                            maxWidth: 96,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        },
                    },
                ]}
            />
            {/* {selected.length > 0 ? (
                <Flex align="center" w="100%">
                    <Flex gap="md" align="center" className="grow">
                        <Stack spacing="sm">
                            <Text size="xl">{selected[0]!.filename}</Text>
                        </Stack>
                    </Flex>
                    <CloseButton
                        disabled={isLoading}
                        onClick={() => setSelected([])}
                        size="lg"
                    />
                </Flex>
            ) : null} */}
        </Box>
    )
}
