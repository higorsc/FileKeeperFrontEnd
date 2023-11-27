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
        //var returnedArray = [,] ;
        var returnedArray = [] ;

        /*returnedArray[0] = '';

        for(var i = 1; i < lastIndex-1; i++)
        {
            returnedArray[i] = array[startIndex + i];
        }
        returnedArray[lastIndex] = '';
*/
        for(var i = 0; i < lastIndex; i++)
        {
            returnedArray[i] = array[startIndex + i];
        }

        /*for(var i = 0; i < lastIndex; i++)
        {
            var value = array[startIndex + i].toString();
            returnedArray[i] = [value.length];

            //console.log(value.length);

            for(var j = 0; j < value.length; j++)
            {
                //console.log(returnedArray);
                //console.log(value[j]);
                returnedArray[i][j] = value[j];
            }
        }*/

        //returnedArray[lastIndex + 1] = new Uint8Array(' ');

        return returnedArray;
    }

    function wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
      }

    const SubmitFileViaStreaming = async () => {
        const stream = new ReadableStream({
            async start(controller) {
              
                var fileBytes = new Uint8Array(await file.arrayBuffer());
                var offset = 0;
                var remaining = file.size;
                var batch = ((1024 * 8192) - 2);
                console.log(fileBytes.length);
                while(remaining != 0)
                {                                 
                    var slice = InclusiveSlice(fileBytes, offset, batch);
                    controller.enqueue(JSON.stringify(slice));
                    console.log(JSON.stringify(slice));
                    remaining -= batch;
                    offset += batch;
                    batch = (remaining - batch) >= batch ? batch : remaining;
                }
                controller.enqueue(JSON.stringify('Teste'));
                controller.close();
            },
          }).pipeThrough(new TextEncoderStream());

        var fileFormat = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
        console.log();

        var response = await fetch('https://localhost:7126/Encryption/ReceiveStream?format=' + fileFormat, {
            method : 'POST',
            body : stream,
            headers : {
                //"content-type": "application/json",
                'Content-Type': 'application/octet-stream',
            },
            duplex : 'half'

        })
        .then(async (response) => console.log(await response.json()))
        .catch(error => console.log(error))
    }

    const SubmitFileAsStream = async () =>
    {
        var fileFormat = fileName.substring(fileName.lastIndexOf('.'), fileName.length);

        var response = await fetch('https://localhost:7126/Encryption/ReceiveStream?format=' + fileFormat, {
            method : 'POST',
            body : file?.stream(),
            headers : {
                'Content-Type': 'application/octet-stream',
            },
            duplex : 'half'

        })
        .then(async (response) => console.log(await response.json()))
        .catch(error => console.log(error))
    }

    const SubmitFileAsForm = async () => {
        var formData = new FormData();

        formData.append("form", file);
        formData.append("Teste", "TestValue");

        formData.set("form", file);
        formData.set("Teste", "TestValue");

        var fileFormat = fileName.substring(fileName.lastIndexOf('.'), fileName.length);
        console.log();

        var response = await fetch('https://localhost:7126/Encryption/EncryptFile', {
            method : 'POST',
            body : formData,
            headers : {
                //"content-type": "application/json",
                //"content-type": "multipart/form-data",
            },
            //duplex : 'half'

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
                <input type="button" value={'Submit'} onClick={e => /*SubmitFile()*/ SubmitFileAsForm()}></input>
                <input type="button" value={'Submit via Streaming'} onClick={e => SubmitFileViaStreaming()}></input>
                <input type="button" value={'Submit as Stream'} onClick={e => SubmitFileAsStream()}></input>

            </div>
        </>
    );
}
