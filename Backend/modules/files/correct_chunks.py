def TextSplit(text: str = "This is a cool text", chunksize: int = 512) -> list:
    output_text = []
    split_text = text.split()
    length = len(split_text)

    if length < chunksize:
        output_text = [" ".join(split_text)]
    else:
        for i in range(1,length//chunksize + 1):
            output_text.append(" ".join(split_text[(i-1)*chunksize:i*chunksize]))
        output_text.append(" ".join(split_text[i*chunksize:]))

    return output_text