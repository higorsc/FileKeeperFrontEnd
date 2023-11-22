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

    const SubmitFile = async () => {
        var formData = new FormData();

        formData.append("form", file);
        formData.append("Teste", "TestValue");
        //formData.set("form", file!);
        //formData.set("Teste", "TestValue");

        const stream = new ReadableStream({
            async start(controller) {
              
                var fileBytes = new Uint8Array(await file.arrayBuffer());
                //var fileBytes = new TextEncoder().encode(await file.arrayBuffer());
                //var fileBytes = await file.arrayBuffer();
                var offset = 0;
                var remaining = file.size;
                var batch = 2046;

                while(remaining != 0)
                {                                 
                    var slice = InclusiveSlice(fileBytes, offset, batch);
                    //var slice = new TextEncoder().encode('Teste');
                    //controller.enqueue(JSON.stringify(slice));
                    controller.enqueue(JSON.stringify(slice));
                    //controller.enqueue(slice);
                    //controller.enqueue('<EOC>');
                    console.log(JSON.stringify(slice));
                    remaining -= batch;
                    offset += batch;
                    batch = (remaining - batch) >= 2046 ? 2046 : remaining;
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
                <input type="button" value={'Submit via Streaming'} onClick={e => SubmitFile()}></input>

            </div>
        </>
    );
}
