/* eslint-disable */

import React, { useEffect, useState } from "react";

export default function EncryptionPage() {
    const [file, setFile] = useState('');
    const [fileName, setFileName] = useState('');

    const SetFileInfos = (file) => {
        setFile(file);
        setFileName(file?.name);
    }

    function InclusiveSlice(array, startIndex, lastIndex)
    {
        var returnedArray = [] ;

        for(var i = 0; i < lastIndex; i++)
        {
            returnedArray[i] = array[startIndex + i];
        }

        return returnedArray;
    }

    const SubmitFile = async () => {
        var formData = new FormData();

        formData.append("form", file);
        formData.append("Teste", "TestValue");
        //formData.set("form", file!);
        //formData.set("Teste", "TestValue");

        const stream = new ReadableStream({
            async start(controller) {
              
                var fileBytes = new Uint8Array(await file.arrayBuffer());
                //var fileBytes = await file.arrayBuffer();
                var offset = 0;
                var remaining = file.size;
                var batch = 2048;

                while(remaining != 0)
                {                                 
                    var slice = InclusiveSlice(fileBytes, offset, batch);
                    controller.enqueue(slice);
                    //controller.enqueue('<EOC>');
                    console.log(slice);
                    remaining -= batch;
                    offset += batch;
                    batch = (remaining - batch) >= 2048 ? 2048 : remaining;
                }

                controller.close();
            },
          }).pipeThrough(new TextEncoderStream());
        
        //console.log(formData.values().next());

        var fileFormat = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
        console.log();

        var response = await fetch('https://localhost:7126/Encryption/ReceiveStream?format=' + fileFormat, {
            method : 'POST',
            body : stream,//file?.stream(),
            headers : {
                "content-type": "application/json",
            },
            duplex : 'half'

        })
        .then(async (response) => console.log(await response.json()))
        .catch(error => console.log(error))
    }

    useEffect(() => {
    }, [file]);

    return (
        <>
            <div>
                <input type="file" onChange={(e) => {
                    SetFileInfos(e.target.files?.item(0))
                }
                }></input>
                <input type="button" value={'Submit'} onClick={e => SubmitFile()}></input>

            </div>
        </>
    );
}
