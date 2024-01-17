import { RouterOutput, trpc } from "@/lib/trpc"
import React, { useEffect, useState } from "react"
import { DataTable } from "mantine-datatable"
import { Box } from "@mantine/core"
import { useRouter } from "next/router"

interface SelectFileProps {
    isLoading: boolean
    onSelect: (id: string | null) => void
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
            if (selected.length === 0) {
                return onSelect(null)
            }
            onSelect(String(selected.at(0)!.id))
        },
        [onSelect, selected],
    )

    return (
        <Box bg="dark.8">
            {/* {typeof window !== "undefined" && ( */}
            <DataTable
                // records={files.data?.files}
                records={
                    selected.length === 0
                        ? files.data?.files
                        : files.data?.files.filter(
                              (file) => file.id === selected.at(0)!.id,
                          )
                }
                fetching={files.isFetching}
                selectedRecords={selected}
                onSelectedRecordsChange={(records) => {
                    if (records.length > 1) {
                        return setSelected([records.at(0)!])
                    }

                    setSelected(records)
                }}
                loadingText="Loading documents"
                noRecordsText="Found no documents"
                recordsPerPage={files.data?.docsPerPage ?? 5}
                totalRecords={files.data?.docs ?? 0}
                minHeight={256}
                onPageChange={(page) => setPage(page)}
                page={page}
                isRecordSelectable={(record) =>
                    selected.length === 0 || record.id === selected.at(0)?.id
                }
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
