import { RouterOutput, trpc } from "@/lib/trpc"
import React, { useEffect, useState } from "react"
import { DataTable } from "mantine-datatable"
import {
    AspectRatio,
    Badge,
    Box,
    CloseButton,
    Flex,
    MultiSelect,
    Stack,
    Text,
} from "@mantine/core"

interface SelectFileProps {
    isLoading: boolean
    onSelect: (id: string | null) => void
}

export function SelectFile({ isLoading, onSelect }: SelectFileProps) {
    const files = trpc.files.getFiles.useQuery({ page: 1 })
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
        <div>
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
                selectedRecords={selected}
                onSelectedRecordsChange={(records) => {
                    if (records.length > 1) {
                        return setSelected([records.at(0)!])
                    }

                    setSelected(records)
                }}
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
        </div>
    )
}
