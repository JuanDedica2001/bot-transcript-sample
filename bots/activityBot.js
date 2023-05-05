const { TurnContext, CardFactory, MessageFactory, TeamsInfo, TeamsActivityHandler } = require('botbuilder');
const GraphHelper = require('../helpers/graphHelper');

class ActivityBot extends TeamsActivityHandler {
    constructor() {
        super();

        // Activity handler for message event.
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            const replyText = `Echo: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));
        });

        // Activity handler for task module fetch event.
        this.handleTeamsTaskModuleFetch = async (context, taskModuleRequest) => {
          try {
            var meetingId = taskModuleRequest.data.meetingId;
            var languageToTranslate = taskModuleRequest.data.language;
            return {
                "task": {
                    "type": "continue",
                    "value": {
                        "title": "Meeting Transcript",
                        "height": 800,
                        "width": 800,
                        "url": `${process.env.AppBaseUrl}/home?meetingId=${meetingId}&language=${languageToTranslate}`,
                    },
                },
            };
          }
          catch (ex) {

            return {
                "task": {
                    "type": "continue",
                    "value": {
                        "title": "Testing",
                        "height": 800,
                        "width": 800,
                        "url": `${process.env.AppBaseUrl}/home` ,
                    },
                },
            };
          }
        }
        
        // Activity handler for meeting end event.
        this.onTeamsMeetingEndEvent(async (meeting, context, next) => {
          var meetingDetails = await TeamsInfo.getMeetingInfo(context);
          var graphHelper = new GraphHelper();
          var result = await graphHelper.GetMeetingTranscriptionsAsync(meetingDetails.details.msGraphResourceId);
          //await sendlerMessage(result);
          if (result != "")
          {
          //result = result.replace("<v", "");
            var foundIndex = transcriptsDictionary.findIndex((x) => x.id === meetingDetails.details.msGraphResourceId);
            
            if (foundIndex != -1) {
              transcriptsDictionary[foundIndex].data = result;
            }
            else {
              transcriptsDictionary.push({
                id: meetingDetails.details.msGraphResourceId,
                data: result.map((x) => `
                <div class="container">
                    <i>${x.time}</i>
                    <div class="container">
                        <strong>${x.author}</strong> <span>${x.text}</span>
                        <div class="translated_text">${x.translatedText}</div>
                    </div>
                </div>
                `).join('')
              });
            }
            var cardJson = {
              "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
              "version": "1.5",
              "type": "AdaptiveCard",
              "body": [
                {
                  "type": "TextBlock",
                  "text": "Here is the last transcript details of the meeting.",
                  "weight": "Bolder",
                  "size": "Large"
                }
              ],
              "actions": [
                {
                  "type": "Action.Submit",
                  "title": "View Transcript: English Translation",
                  "data": {
                    "msteams": {
                      "type": "task/fetch"
                    },
                    "meetingId": meetingDetails.details.msGraphResourceId,
                    "language": "en"
                  }
                },
                {
                  "type": "Action.Submit",
                  "title": "View Transcript: Italian Translation",
                  "data": {
                    "msteams": {
                      "type": "task/fetch"
                    },
                    "meetingId": meetingDetails.details.msGraphResourceId,
                    "language": "it"
                  }
                },
                {
                  "type": "Action.Submit",
                  "title": "View Transcript: German Translation",
                  "data": {
                    "msteams": {
                      "type": "task/fetch"
                    },
                    "meetingId": meetingDetails.details.msGraphResourceId,
                    "language": "de"
                  }
                },
                {
                  "type": "Action.Submit",
                  "title": "View Transcript: French Translation",
                  "data": {
                    "msteams": {
                      "type": "task/fetch"
                    },
                    "meetingId": meetingDetails.details.msGraphResourceId,
                    "language": "fr"
                  }
                },
              ]
            };

            await context.sendActivity({ attachments: [CardFactory.adaptiveCard(cardJson)] });
          }
          else
          {
            var notFoundCardJson = {
              "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "1.5",
                "type": "AdaptiveCard",
                "body": [
                  {
                    "type": "TextBlock",
                    "text": "Transcript not found for this meeting.",
                    "weight": "Bolder",
                    "size": "Large"
                  }
                ]
              };
              
              await context.sendActivity({ attachments: [CardFactory.adaptiveCard(notFoundCardJson)] });
          }
        });
    }
    sendMessage = (sendler) => async (item) => {
      await sendler.sendActivity(MessageFactory.text(JSON.stringify(item, null, 2)));
    }
}
module.exports.ActivityBot = ActivityBot;