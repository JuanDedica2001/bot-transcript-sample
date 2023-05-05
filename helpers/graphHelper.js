const axios = require('axios');
const webvtt = require('node-webvtt');
require('isomorphic-fetch');
class GraphHelper {
    constructor() {
        this._token = this.GetAccessToken();
    }

    /**
     * Gets application token.
     * @returns Application token.
     */
    GetAccessToken() {
        let qs = require('qs')
        const data = qs.stringify({
            'grant_type': 'client_credentials',
            'client_id': process.env.MicrosoftAppId,
            'scope': 'https://graph.microsoft.com/.default',
            'client_secret': process.env.MicrosoftAppPassword
        });

        return new Promise(async (resolve) => {
            const config = {
                method: 'post',
                url: 'https://login.microsoftonline.com/' + process.env.MicrosoftAppTenantId + '/oauth2/v2.0/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: data
            };

            await axios(config)
                .then(function (response) {
                    resolve((response.data).access_token)
                })
                .catch(function (error) {
                    resolve(error)
                });
        })
    } 

    /**
     * Gets the meeting transcript for the passed meeting Id.
     * @param {string} meetingId Id of the meeting
     * @returns Transcript of meeting if any therwise return empty string.
     */
    async GetMeetingTranscriptionsAsync(meetingId, messageSendler)
    {
        try
        {
            var access_Token = await this._token;
            var getAllTranscriptsEndpoint = `${process.env.GraphApiEndpoint}/users/${process.env.UserId}/onlineMeetings/${meetingId}/transcripts`;
            const getAllTranscriptsConfig = {
                method: 'get',
                url: getAllTranscriptsEndpoint,
                headers: {
                    'Authorization': `Bearer ${access_Token}`
                }
            }

            var transcripts = (await axios(getAllTranscriptsConfig)).data.value;
            messageSendler && messageSendler(transcripts)
            if (transcripts.length > 0 && transcripts != null)
            {
                var getTranscriptEndpoint = `${getAllTranscriptsEndpoint}/${transcripts[1].id}/content?$format=text/vtt`;
                const getTranscriptConfig = {
                    method: 'get',
                    url: getTranscriptEndpoint,
                    headers: {
                        'Authorization': `Bearer ${access_Token}`
                    }
                };
                
                var transcript = (await axios(getTranscriptConfig)).data;
                messageSendler && messageSendler(transcript)
                return this.parseResult(transcript);
            }
            else
            {
                return "";
            }   
        }
        catch (ex)
        {
            messageSendler && messageSendler(ex)
            return "";
        }
    }
    async parseResult(text) {
        const cleanText = text.split('\r\n').filter(item => item != '' && item !== 'WEBVTT');
        for(let i = 0; i < cleanText.length; i++) {
            cleanText[i] = cleanText[i].replace('<v ', '').replace('</v>', '').replace('>',': ');
        }
        const onlyTimeStamps = cleanText.filter(item => item.includes('--:'));
        const onlyText = cleanText.filter(item => !item.includes('--:'));
        const parsedResult = onlyTimeStamps.map((item, index) => {
            const [author, text] = onlyText[index].split(': ')
            return {
                time: item,
                author,
                text,
            };
        })
        console.log(parsedResult);
        return parsedResult;
    }
}
module.exports = GraphHelper;