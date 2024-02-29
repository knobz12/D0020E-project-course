import React, { ChangeEvent, useState } from "react"
import { TextInput } from "@mantine/core"

export type SearchProp = {
    onSearch: (value: string) => void
}

const SearchBar = (props: SearchProp) => {
    const { onSearch } = props

    const [value, setValue] = useState("Enter search")

    const searchHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const { target } = event
        setValue(target.value)
        //console.log(value)
    }

    const keyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            onSearch(value)
            //console.log(value)
        }
    }

    return (
        <div>
            <TextInput
                placeholder={value}
                onChange={searchHandler}
                onKeyDown={keyDownHandler}
            />
        </div>
    )
}

export default SearchBar
