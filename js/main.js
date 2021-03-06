/*
//  MIT License
//
//  Copyright (c) 2022 McDadda
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
//
//
//  By JeffersonKay - please ask before sharing this repository. I like to keep record
//  of roughly how many people this tool has reached.
//
//  Initially used for the Training and Recruitment division of the GTAW Fire Department, 
//  repurposed for the GTAW State Fire Marshals with modificiations and adjustments to fit 
//  the needs of the LSPD on GTA Chronicles.
//
//  Edit, copy, do whatever. I don't care. Just leave the credits; read the license.
//
//  TODO: this file needs some cleaning up, comments, etc. I'll eventually get to it.
//
*/

// Template variables
const TPLTVAR_HEADER_IMAGE_LINK       = '$HEADER_IMAGE_LINK$';       // The header image link provided by the user
const TPLTVAR_DIVBOX_COLOR            = '$DIVBOX_COLOR$';            // The color for the title divbox and the legend headers
const TPLTVAR_INTERVIEWEE_NAME        = '$INTERVIEWEE_NAME$';        // The name of the interviewee
const TPLTVAR_PREINTERVIEW_TEXT       = '$PREINTERVIEW_TEXT$';       // The preinterview text - any dialog/RP before the first question
const TPLTVAR_QUESTIONS_CONTAINER     = '$QUESTIONS_CONTAINER$';     // Replaced by a string containing all the question templates combined
const TPLTVAR_QUESTION_TEXT           = '$QUESTION_TEXT$';           // The question itself (should be limited to a single line)
const TPLTVAR_QUESTION_ANSWER_CONTENT = '$QUESTION_ANSWER_CONTENT$'; // The answer and any dialog/RP related to the question
const TPLTVAR_INTERVIEWER_NAME = '$INTERVIEWER_NAME$'; // Interviewer's name
const TPLTVAR_GRAMMAR_MARK = '$GRAMMAR_MARK$'; // The Grammar mark given.
const TPLTVAR_ROLEPLAY_MARK = '$ROLEPLAY_MARK$'; // The Roleplay mark given.
const TPLTVAR_EXTRA_INFORMATION = '$EXTRA_INFO$'; //Extra Information given
const TPLTVAR_TATTOO = '$TATTOOVALUE$'; // Tattoo's yes/no

// The main template is the parent template; individual question templates are parsed
// and then embedded within this template.
const MAIN_TEMPLATE = `[divbox=#e9e9e9]

[imageleft]https://puu.sh/INzXg/87ea367679.png[/imageleft]
[b][b][align=right]LOS SANTOS POLICE DEPARTMENT
P.O. BOX 30142
LOS SANTOS, SA 87447
313 PICO BOULEVARD[/align][/b][/b]


[hr][/hr]
[centre][b]OFFICE OF SUPPORT SERVICES[/b]
[b]PERSONNEL AND TRAINING BUREAU[/b]
[b]RECRUITMENT AND EMPLOYMENT DIVISION[/b]
[hr][/hr]

[divbox=#1628c4][centre][color=#FFFFFF][b]Interview Questions[/b][/color][/centre][/divbox]

[hr][/hr]

[list=none][b][u]Details[/u][/b]
[list=none][b]Applicant Name:[/b] ${TPLTVAR_INTERVIEWEE_NAME}
[b]Interviewer Name:[/b] ${TPLTVAR_INTERVIEWER_NAME}
[/list][/list]

[hr][/hr]

[list=none][b][u]Interview Summary[/u][/b]
[list=none][spoiler=Interview Log][b]Interview Log[/b]
[legend=${TPLTVAR_DIVBOX_COLOR}, Preinterview]${TPLTVAR_PREINTERVIEW_TEXT}[/legend]
${TPLTVAR_QUESTIONS_CONTAINER}
[/list][/spoiler][/list]

[hr][/hr]

[list=none][b][u]Interview Review[/u][/b]
[list=none][b]Grammar:[/b] ${TPLTVAR_GRAMMAR_MARK}/5
[b]Roleplay:[/b] ${TPLTVAR_ROLEPLAY_MARK}/5
[/list][/list]

[hr][/hr]

[list=none][b][u]Other Information[/u][/b]
[list=none][b]Notes:[/b] ${TPLTVAR_EXTRA_INFORMATION}
[/list]
[list=none][b]Does the applicant have any tattoo's on the Neck, Face or Hand:[/b]
[list=none]${TPLTVAR_TATTOO}[/list][/list][/list]

[hr][/hr]

[centre][size=85](This section is to be filled out by supervisors only)[/size][/centre]
[color=#FFFFFF].[/color]
[list=none][b]SUPERVISOR INFORMATION[/b]
[list=none][b]REVIEWED BY:[/b]
[b]PASS OR FAIL[/b]
[/list][/list]

[color=#FFFFFF].[/color]
[hr][/hr][/divbox]
`

// Individual question template
const QUESTION_TEMPLATE = `[legend=${TPLTVAR_DIVBOX_COLOR}, ${TPLTVAR_QUESTION_TEXT}]${TPLTVAR_QUESTION_ANSWER_CONTENT}[/legend]`

// Errors
let g_HasError = false;
const g_ErrorDiv = document.getElementById('div-error');

// Default colors
const g_DefaultDivboxColor  = '#1628c4'; // Some shade of blue
const g_DefaultRoleplayColor = '#AD82CE'; // Some shade of purple

// Form data
let g_InterviewerName = ''; // Interviewer name
let g_IntervieweeName = ''; // Interviewee name
let g_BadgeNumber = '';     // Interviewer's badge number
let g_HeaderImageLink = ''; // Header image link
let g_Participants = [];    // Interview participants to include
let g_DivboxColor = '';     // Divbox color
let g_RoleplayColor = '';   // Role play color
let g_RoleplayMark = ''; // Roleplay mark
let g_GrammarMark = '';  // Grammar mark
let g_ExtraNotes = ''; // Extra User Notes
let g_Tattoo = ''; // Tattoos yes/no

// Handle the file selector element...
const fileSelector = document.getElementById('input-chatlog-file');
fileSelector.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file.type && file.type.indexOf('text') === -1) {
        console.log('File is not a text document.', file.type, file);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        g_InterviewerName   = document.getElementById('input-interviewer-name').value;
        g_IntervieweeName   = document.getElementById('input-interviewee-name').value;
        g_BadgeNumber       = document.getElementById('input-interviewer-badge').value;
        g_HeaderImageLink   = parseImgurLink();
        g_DivboxColor       = parseColor('input-divbox-color', g_DefaultDivboxColor);
        g_RoleplayColor     = parseColor('input-roleplay-color', g_DefaultRoleplayColor);
        g_Participants      = parseParticipants();
        g_RoleplayMark      = document.getElementById('input-roleplay-mark').value;
        g_GrammarMark       = document.getElementById('input-grammar-mark').value;
        g_ExtraNotes        = document.getElementById('input-extra-information').value;
        g_Tattoo            = document.getElementById('input-tattoo-value').value;

        // Only parse when there weren't any custom errors.
        if (!g_HasError) {
            parseChatLog(event.target.result.split('\n'));
        }
        g_HasError = false; // Don't force the user to refresh after correcting an error.
    };

    reader.readAsText(file);
});

function parseParticipants() {
    let participants = [];
    let participantsText = document.getElementById('input-participants-names').value;
    for (let i = 0; i < participantsText.split('\n').length; i++) {
        participants.push(participantsText[i]);
    }
    participants.push(g_InterviewerName); // The interviewer is a participant.
    participants.push(g_IntervieweeName); // The interviewee is a participant.
    return participants;
}

function parseImgurLink() {
    let headerLink = document.getElementById('input-header-img-link').value;
    if (headerLink)
    {
        // When the header link isn't conforming to the format, let the user know.
        if (!(headerLink.endsWith('.png') || headerLink.endsWith('.jpeg'))) {
            showError("The provided Imgur link isn't valid. Double check that it has .jpeg or .png at the end.");
            return;
        }

        headerLink = `[img]${headerLink}[/img]`;
    }
    return headerLink;
}

function parseColor(elementId, defaultValue = "") {
    let element = document.getElementById(elementId);
    if (element == null) {
        console.log("This shouldn't happen... Unless someone's been toying with the source code. Anyway, parseColor argument elementId is null.");
        return;
    }

    let color = element.value;

    // Assign the default value if the user hasn't entered a color code.
    if (!color)
        color = defaultValue;

    // Append the '#' necessary for BB code to recognize the color if the user forgot
    // to include it. No biggie, I will add it for you, dear user.
    if (!color.startsWith('#')) {
        color = '#' + color;
    }
    return color;
}

/*
//  An interview starts and ends the moment the following sentence is uttered:
//      "[faction rank] [full name], badge number [badge number], starting/ending interview..."
//
//  The only unique element in this sentence is the interviewer's badge number. It is
//  highly unlikely that the badge number is repeated anywhere, but just to make sure, we
//  extend the pattern to include the word "interview". The chance that these two elements
//  are put together in a non-interview context is /extremely/ low.
//  
//  An interview is marked as "ongoing" in the algorithm when both these elements are
//  uttered in the same line. Examples:
//      "Jeffrey Kendall, badge number 52511, starting interview ..."
//      "Recruitment Director, badge number 8975412, ending interview ..."
//
//  As long as both the badge number and the word 'interview' are in the same line,
//  any variation will do.
*/
function parseChatLog(lines) {
    let allQuestions = '';  // A string containing all formatted questions
    let q_Header     = '';  // A string containing the question itself
    let q_Content    = '';  // A string containing all dialog related to a single question, except for the question itself

    let isDescription = false; // Keeps track of whether the current line belongs to the description text of any participant

    let preinterviewContent = '';
    let isPreinterview = true;

    let isInterviewOngoing = false;

    for (let i = 0; i < lines.length; i++) {
        // Remove timestamps...
        lines[i] = lines[i].replace(/\[(\d)+:(\d)+:(\d)+\]/g, '');

        // Trim endlines and whitespace from the beginning of the line and 
        // the end...
        lines[i] = lines[i].trim();

        // The end/start pattern is encountered...
        if (lines[i].includes(g_BadgeNumber) && lines[i].includes("interview")) {
            // Toggle the interview state...
            isInterviewOngoing = !isInterviewOngoing;

            // The interview's ongoing state was /just/ toggled off,
            // thus the interview has ended.
            if (!isInterviewOngoing) {
                q_Content += `${lines[i]}\r\n\r\n`;

                // Commit the last question...
                allQuestions += formatQuestion(q_Header, q_Content);
    
                // Stop parsing the chat...
                break;
            }
        }

        // The interview hasn't started yet, so we don't care about the 
        // current line.
        if (!isInterviewOngoing) {
            continue;
        }

        // Skip duplicate /ame lines...
        if (i < lines.length && isInterviewerAme(lines[i]) && isInterviewerAme(lines[i+1])) {
            console.log(`line skipped (duplicate ame): ${lines[i]}`);
            continue;
        }

        // Mark the start of a description and skip the line...
        if (lines[i].startsWith('___Description')) {
            isDescription = true;
            continue;
        }
        
        // As long as the current line is part of the description, skip it...
        if (isDescription) {
            // Unless it starts with "Injuries:" which is the last line of a
            // character's description.
            if (lines[i].startsWith('Injuries:')) {
                isDescription = false;
                i++; // Skip the next line as well
                continue;
            } else {
                // Skip the description line...
                continue;
            }
        }

        // If it's an irrelevant line; OOC chatter, various commands, adverts, etc.
        // then skip those too. Also, if the line wasn't sent by any participant,
        // then we don't care about it either.
        if (isMetaLine(lines[i]) || !isLineSentByParticipant(lines[i])) {
            continue;
        }

        // When the line is a roleplay emote, apply the color...
        if (isRoleplayLine(lines[i])) {
            lines[i] = `[color=${g_RoleplayColor}]${lines[i]}[/color]`;
        }

        // The line is a question...
        if (lines[i].trim().endsWith('?') && lines[i].startsWith(g_InterviewerName)) {
            // The value of q_Content is the preinterview when isPreinterview = true
            if (isPreinterview) {
                preinterviewContent = q_Content;
                isPreinterview = false;
            } else {
                // Add the formatted question to the questions container...
                allQuestions += formatQuestion(q_Header, q_Content);
            }

            // Start a new formatted question...
            q_Header  = lines[i].replace(`${g_InterviewerName} says: `, ''); // remove the "says: " part from the line
            q_Content = '';
        } else {
            // Add the line to the current question if it wasn't the question...
            q_Content += `${lines[i]}\r\n\r\n`;
        }
    }

    // The interview couldn't be parsed.
    if (!allQuestions) {
        showError("The parser was unable to locate the start of the interview. Make sure your badge number and the word \"interview\" are in the same sentence.");
        return;
    }

    // Output a formatted topic
    let formattedTemplate = MAIN_TEMPLATE;
    formattedTemplate = formattedTemplate.replace(TPLTVAR_HEADER_IMAGE_LINK, g_HeaderImageLink);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_PREINTERVIEW_TEXT, preinterviewContent);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_INTERVIEWEE_NAME, g_IntervieweeName);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_INTERVIEWER_NAME, g_InterviewerName);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_QUESTIONS_CONTAINER, allQuestions);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_GRAMMAR_MARK, g_GrammarMark);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_ROLEPLAY_MARK, g_RoleplayMark);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_EXTRA_INFORMATION, g_ExtraNotes);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_TATTOO, g_Tattoo);


    const divColorRegex = new RegExp(escapeRegExp(TPLTVAR_DIVBOX_COLOR), 'g');
    formattedTemplate = formattedTemplate.replace(divColorRegex, g_DivboxColor);
    document.getElementById('output-box').value = formattedTemplate;
}

function escapeRegExp(unescapedString) {
    return unescapedString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// formatQuestion...
//      q_header:   the question itself
//      q_content:  the answer and all the dialog as a response to the question
function formatQuestion(q_header, q_content) {
    let formattedTemplate = QUESTION_TEMPLATE;
    formattedTemplate = formattedTemplate.replace(TPLTVAR_QUESTION_TEXT, q_header);
    formattedTemplate = formattedTemplate.replace(TPLTVAR_QUESTION_ANSWER_CONTENT, q_content);
    return formattedTemplate;
}

// isMetaLine checks against predefined patterns of irrelevant meta chatter.
function isMetaLine(line) {
    const patterns = [
        // OOC chatter is meta...
        new RegExp(/^\(\(/),

        // Online list...
        new RegExp(/The ID of/),

        // Ads are meta...
        new RegExp(/^\[(Business |Company )?Advertisement\]/),

        // Radio chatter is meta...
        new RegExp(/(^\*\*\[S: [0-9]+ \| CH: [0-9]+\])|(-> (ALL|LSFD|LSPD|LSSD|LAW|DMEC)\])|(^\*\*\[CH: ATC\])/),

        // (Non-)Emergency calls are meta...
        new RegExp(/((EMERGENCY CALL)|(^\* Message:)|(^\* Log Number:)|(^\* Phone Number:)|(^\* Location:)|(^\* Situation:))/),
    ];

    // Step through each of the patterns and check if the line has a match...
    for (let i = 0; i < patterns.length; i++) {
        // There's a match...
        if (patterns[i].test(line)) {
            return true;
        }
    }
    return false;
}

function isLineSentByParticipant(line) {
    for (let i = 0; i < g_Participants.length; i++) {
        if (line.includes(g_Participants[i])) {
            return true;
        }
    }
    return false;
}

// when check_meta = false, the second operand of the AND operation is true,
// making it the sole responsibility of String.startsWith to influence the
// end result of this predicate. Otherwise, isMetaLine() gets to influence it
// as well. It's only fair.
function isRoleplayLine(line, check_meta = false) {
    return (line.startsWith('*') || line.startsWith('>')) && (check_meta ? !isMetaLine(line) : true);
}

function isInterviewerAme(line) {
    return line.includes(`> ${g_InterviewerName}`);
}

function showError(error) {
    g_ErrorDiv.className = "alert alert-danger my-4";
    g_ErrorDiv.innerHTML = `${error}`;
    g_HasError = true;

    // Force the user back to the top. They may not see the error otherwise.
    g_ErrorDiv.scrollIntoView();
}

// Word from God; credits to: https://jcpsimmons.github.io/Godspeak-Generator/
// I simply reminded God of some words, for He knew all
const godsVocabularyHawaiian = [
    "ka mea", "kona", "ia", "I", "ia", "no ka mea", "maluna o", "ua", "me", "lakou", "e", "ma", "??ekahi", "loaa", "keia", "mai", 
    "ma", "anal", "olelo", "aka", "ka mea", "kekahi", "e like me", "ka mea", "ia", "oe", "ai ole ia", "i", "ka", "a", "i", 
    "a", "he", "iloko o", "makou", "hiki", "aku", "kekahi", "he", "ka mea", "hana", "ko lakou", "manawa", "ina", "makemake", "pehea", 
    "mai la", "kekahi", "kela a me keia", "hai aku", "hana", "i", "??ekolu", "makemake", "ea", "pono", "no hoi", "paani", "uuku", "hopena", "kau", 
    "ka hale", "heluhelu mai o", "lima", "ke awa", "nui", "wale", "hui", "a hiki", "aina", "maanei", "pono", "nui", "ki??eki??e", "ia", "hahai", 
    "hana", "no ke aha mai", "noi", "kanaka", "loli", "hele", "malamalama", "keia ano", "aku", "pono", "ka hale", "ki??i", "hoao", "makou", "hou", 
    "holoholona", "wahi", "makuahine", "ao", "kokoke", "hana", "iho", "honua", "makuak??ne", "kekahi", "hou", "hana", "hapa", "lawe", "loaa", 
    "wahi", "hana", "ola", "kahi", "mahope iho o", "i hope", "iki", "wale no", "a", "kanaka", "makahiki", "hele mai", "hoike", "o kela", "maika??i loa", 
    "mai ia??u", "haawi", "makou", "malalo o", "inoa", "loa", "ma", "pono", "ano", "olelo", "nui", "manao", "aku nei au", "kokua", "haahaa", 
    "laina", "oko", "huli", "kumu", "nui", "ke ano o", "imua o", "hu", "akau", "keiki", "ka wa kahiko", "oi aku", "ia", "ia", "a pau", 
    "laila", "i ka wa", "ae la", "ho??ohana", "oukou", "ala", "e pili ana i", "he nui", "alaila", "ia lakou", "kakau", "makemake", "like me", "pela", "mau", 
    "ia", "loihi", "hana", "mea", "ike", "ia", "??elua", "i", "nana", "hou", "l??", "hiki", "hele", "hele mai", "hana", 
    "helu", "hookani", "??a??ole", "loa", "kanaka", "i ko??u", "maluna o", "ike", "ka wai", "mamua o", "kahea", "ka mua", "ka mea", "Mei", "iho", 
    "aoao", "i", "Ano", "loaa", "poo", "ku", "iho", "palapala", "e", "aina", "loaa", "pane", "kula", "ulu", "like", 
    "malie", "e ao", "kanu", "aloha", "ai", "l??", "??eh??", "waena o", "moku?????ina", "malama", "maka", "loa", "hope", "e", "mana??o", 
    "kulanakauhale", "laau", "kela aoao", "mahi??ai", "paakiki", "ho??omaka", "ikaika", "mo??olelo", "i ike ai", "loa", "kai", "huki", "hema", "hopena o", "ho??oholo", 
    "hana, aole", "oiai", "kaomi", "kokoke", "p??", "maoli", "ola", "kakaikahi", "ke akau", "buke", "lawe", "lawe", "nauka", "ai", "lumi", 
    "hoaaloha", "hoomaka ae", "mana??o", "i??a", "mauna", "hooki", "p??kahi", "kumu", "lohe", "ka lio", "e oki ai", "paa", "kiai", "kala like ???ole", "maka", 
    "laau", "ka papa kuhikuhiE", "hamama", "he", "pu", "a??e", "ke??oke??o", "keiki", "hoomaka", "loa??a", "hele", "Eia", "hoopau i", "pepa", "hui", 
    "mau", "aloha", "mau", "elua", "mark", "pinepine", "palapala", "a hiki i", "ka mile", "muliwai", "ka??a", "wawae", "m??lama", "ka lua", "lawa", 
    "maopopo", "kaikamahine", "mau", "opiopio", "makaukau", "luna", "loa", "??ula??ula", "papa", "nae", "haha aku", "o anakuhi", "manu", "koke", "kino", 
    "?????lio", "ohana", "kauoha", "oweliweli", "waiho", "mele", "ana", "puka", "huahana", "??ele??ele", "p??kole", "numeral", "papa", "makani", "ninau", 
    "hiki mai ana", "loa", "moku", "wahi", "hapalua", "pohaku", "aoao", "ke ahi", "ka hema", "pilikia", "kauwahi", "ha??i", "ike", "kekahi", "mai", 
    "luna", "a pau", "ke alii", "alanui", "?????niha", "hoonui", "aole", "ana", "noho", "huila", "piha", "ikaika", "pol??", "mea", "hooholo", 
    "ili", "hohonu", "luna", "mokupuni", "wawae", "nenoaiu", "????? i", "h????ike", "mooolelo", "moku", "like", "gula", "hiki", "pelane", "wahi", 
    "maloo", "hoohuoi", "akaaka", "tausani", "aku nei", "holo", "huli", "hihiu", "helehelena", "equate", "anal", "Miss", "lawe mai", "wela", "hau", 
    "kaea", "lawe mai", "??ae", "ke kaawale ana", "hoopiha", "ka hikina", "pena", "?????lelo", "mawaena o", "pa alima", "mana", "kulanakauhale", "uku", "kekahi", "lele", 
    "haule", "alakai", "kahea ana", "pouli", "Maker", "palapala aie", "kali", "kuka", "huahelu", "hoku", "pahu", "noun", "mahina??ai", "maha", "pololei", 
    "hiki", "paona", "hana", "nani", "a holo", "ku", "no", "alo", "ao", "pule", "hope loa", "haawi", "????ma??oma??o", "oh la", "poe ola", 
    "ho??om??hala", "moana", "pumehana", "like me", "minuke", "ikaika", "k??ikaw??", "manao", "mahope", "maopopo", "huelo", "paka", "mea", "makahiki", "lohe", 
    "pono", "hola", "maikai", "oiaio", "iloko o", "haneri", "??elima", "no", "???anu??u", "koke", "paa", "komohana", "honua", "panee", "hiki", 
    "hookeai", "verb", "mele", "hoolohe", "??eono", "papa??aina", "hele", "emi", "kakahiaka", "??umi", "mea", "mau", "vowel", "ma", "kaua", 
    "waiho", "ku", "kumu", "kali", "kikowaena", "aloha", "kanaka", "kala", "malama", "hele mai", "alanui", "palapala ?????ina", "ka ua", "rula", "hoomalu", 
    "huki", "anu", "Hoike", "leo", "ikehu", "i ho??oh??lua", "paha", "moe", "kaikua??ana, kaikaina", "hua", "No Lilo", "aeea", "manaoio", "paha", "e koho i", 
    "ulia", "helu", "p??ho??onui", "kumu", "loa", "ho i", "oe", "kumuhana", "m??hele", "ka nui", "lauwili", "hoonoho au", "olelo", "kaumaha", "nui", 
    "hau", "mea", "kaiapili", "mau", "n??", "m??hele", "syllable", "mana??o", "Luna nui", "poepoe", "aka", "hawewe", "papa", "Pu??uwai", "no", 
    "keia", "kaumaha", "hula", "engine", "wahi", "lima", "ka laula", "holo", "mea", "mahele", "nahele", "noho", "l??hui", "puka makani", "hale k????ai", 
    "ke kau", "nalowale", "hiamoe", "hoao", "Lone", "wawae", "me ka", "pa", "hoopahele ae la i", "mauna", "makemake", "lani", "papa", "olioli", "hooilo", 
    "P????aono", "kakauia", "hihiu", "hana", "malama", "aniani", "ka mauu", "bipi", "oihana", "lihi", "hoailona", "makaikai", "i hala iho nei", "pahee", "le??ale??a", 
    "ao alohilohi i", "kinoea", "map", "mahina", "miliona", "lawe", "ho??opau", "hau??oli", "manaolana", "pua", "hoaahu", "malihini", "Hana Party", "kuai", "e ho??onui i", 
    "huakai", "oihana", "loaa", "lalani", "waha", "mau", "h????ailona", "make", "ka li??ili??i loa", "pilikia", "hooho", "koe nae", "kakau iho la", "hua", "leo", 
    "hui", "paipai", "maemae", "??olu??olu o", "wahine", "iwilei", "ala", "ino", "puupuu", "aila", "ke koko", "hoopa aku", "ulu", "keneta", "hui", 
    "hui", "uea", "k??ki", "nalowale", "palaunu", "komo", "k??h??pai", "like", "hoouna", "koho", "haule iho la", "pono", "kahe ana", "maikai", "pali", 
    "ohi", "hoola", "hooponopono", "kekimala", "pepeiao", "e ae", "loa", "uhai", "hihia", "waena", "pepehi", "keikik??ne", "Lake", "manawa", "p??l??ki??", 
    "loa", "waipuna", "malama", "keiki", "pololei", "leokanip??", "lahuikanaka", "puke wehewehe?????lelo", "waiu", "ka m??m?? holo", "hana", "hui", "uku", "makahiki", "pauku", 
    "male", "ao", "haohao", "m??lie", "pohaku", "wahi", "pii ana", "anu", "manao", "ilihune", "puu", "ho??okolohua", "lalo", "k??", "hao", 
    "hookahi", "ko??oko??o", "i lalo", "??iwak??lua", "ili", "mino??aka", "crease", "puka", "lele", "p??p??", "??ewalu", "kauhale", "ku i", "aa", "kuai", 
    "hoala mai", "ke ho??oponopono", "metala", "paha", "pale wale", "??ehiku", "pauk??", "ke kolu", "e", "paa ana", "lauoho", "kakau", "Kapena Kuke", "papahele", "kekahi", 
    "result", "puhi", "puu", "maluhia", "popoki", "kenekulia", "noonoo", "??Ano", "kanawai", "iki", "mokuna", "kope", "hopuna?????lelo", "h??mau", "ki??eki??e", 
    "one", "aina", "?????wili", "wela", "manamana lima", "hana", "waiwai", "kaua", "moe", "pepehi", "ka naita", "maoli", "Hawaii", "hoohalike", "po??o", 
    "e ole", "noho", "weliweli", "hua", "waiwai", "manoanoa", "koa", "ka??ina", "hana", "hana", "ana", "pa??akik??", "kauka", "e ??olu??olu", "hoomalu", 
    "awakea", "i??ohi??ia", "k??ia", "?????we??awe??a", "ku", "haumana", "ke kihi", "???ao??ao", "lako hou", "kona", "huli ana", "ke komo lima", "ano", "insect", "loaa", 
    "manawa", "hoike", "Radio", "olelo", "?????toma", "kanaka", "m????aukala", "kanawai", "pila nui", "makemake", "iwi", "hoino aku", "manao wale", "e hoomakaukau i", "ae", 
    "pela", "akahai", "wahine", "luna", "koho", "pono", "oi", "?????heu", "hana", "hoalauna", "holoi ai", "?????pe??ape??a", "e aho", "lehulehu", "palaoa", 
    "hoohalike", "poem", "kaula", "bele", "hilinai", "ai", "hamo i", "Tube", "kaulana", "dala", "kahawai o", "makau", "maka", "lahilahi", "triangle", 
    "Honua", "wikiwiki", "kahuna", "panalaau ia", "uaki", "i ko??u", "Ka Hawai i", "komo", "nui", "hawaiian", "huli", "hoouna aku", "melemele", "ka p??", "ae aku", 
    "pa??i", "make", "wahi", "waonahele", "hoopii", "papa", "ke ea??e", "ala", "hiki", "haku", "Track", "makua", "mauka", "mahele", "pepa", 
    "waiwai", "i ka lokomaikaiia", "ho??ohui", "l????au k??", "ke lilo aku", "chord", "kona kaikea a", "olioli", "ki??i", "puu", "wahi", "makuak??ne", "ka berena", "kauoha", "pono", 
    "hookolokolo", "kaumaha", "Ho??ohana", "kauwa", "Duck", "koi aku la lakou", "makeke", "degere", "hoolahaia???ku [na kanaka", "chick", "aloha", "??enemi", "pane", "inu", "ana", 
    "k??ko??o", "olelo", "maoli", "huahelu", "mahu", "ka noi", "ala", "wai", "m????aukala", "ia mea", "puu", "niho", "iwi", "??????????", "ka oxygen", 
    "k??pa??a", "make", "nani", "akamai", "na wahine", "manawa", "p????oihana", "M??k??neki", "kala", "aloha", "lala", "??", "kau hope", "ka oi aku", "laau", 
    "makau", "nui", "kaikua??ana, kaikaina", "kila", "k??k??k??k??", "mua", "ano like", "alakai", "ka hoao ana", "manual", "kii onohi", "kuai", "alakai", "kukulu iho", "kapa", 
    "nuipa", "k??leka", "hui", "kaula", "oihana", "lanakila ???", "moe", "ahiahi", "ano", "??ai", "ho??opololei", "huina", "kumu o", "honi", "aw??wa", 
    "aole", "palua", "noho", "ho??omau", "aeie", "pakuhi", "ua inaina i ka", "kuai", "holomua", "poe", "unuhi", "hanana", "mau", "hana", "???au??au", 
    "manawa", "ku pono ana", "wahine", "k??ma??a", "po??ohiwi", "hoolaha aku", "hooponopono", "hoomoana", "invent", "pulupulu", "Born", "hooholo", "quart", "??eiwa", "kona kalaka", 
    "a noise", "ilikai", "wale", "houluulu", "po??ohiwi", "?????", "hoolei", "alohi", "waiwai", "kolamu", "molecule", "koho i", "hewa", "hinahina", "hana hou"    
];

const godsVocabularyTurkish = [
    "abla", "acaba", "acele", "ac??", "a??", "a????", "a????lmak", "a??mak", "ad", "ada", "adam", "??det", "adres", "affetmek", "afiyet", "a??abey", 
    "a??a??", "a????r", "a????z", "a??lamak", "a??r??mak", "a??ustos", "aile", "ait", "ak", "ak??l", "ak??ll??", "akmak", "ak??am", "alay", "al??ak", 
    "al??n", "al????mak", "al????veri??", "allah", "allaha??smarlad??k", "almak", "alt", "alt??", "alt??n", "altm????", "ama", "an", "ana", "anahtar", "ancak", 
    "anlamak", "anlatmak", "anne", "apartman", "araba", "aral??k", "aramak", "arka", "arkada??", "armut", "art??k", "arzu", "asans??r", "asker", "a??a????", 
    "at", "ata", "ate??", "atmak", "avukat", "ay", "ayak", "ayakkab??", "ayd??nl??k", "ayna", "ayn??", "ayran", "ayr??", "ayr??lmak", "az", 
    "azalmak", "B", "baba", "bacak", "ba??", "ba??l??", "bahar", "bah??e", "bakan", "bakkal", "bakmak", "bal??k", "balkon", "banka", "banyo", 
    "bardak", "basmak", "ba??", "ba??armak", "ba??bakan", "ba??ka", "ba??lamak", "bat??", "batmak", "bavul", "bay", "bayan", "bay??lmak", "bayram", "bazan", 
    "baz??", "bebek", "be??enmek", "bek??r", "beklemek", "belediye", "belge", "belki", "belli", "ben", "benzin", "beraber", "berber", "beri", "beslemek", 
    "be??", "bey", "beyaz", "beyefendi", "b????ak", "b??rakmak", "biber", "bildirmek", "bile", "bilet", "bilet??i", "bilgi", "bilmek", "bin", "bina", 
    "binmek", "bir", "bira", "biraz", "birle??ik", "birlik", "bisiklet", "bitirmek", "bitmek", "biz", "bluz", "bo??az", "bol", "bor??", "bo??", 
    "boy", "boyun", "bozmak", "bozuk", "bozulmak", "b??lge", "b??l??m", "b??rek", "b??yle", "bu", "bu??uk", "bug??n", "bulmak", "bulu??mak", "bulut", 
    "bulvar", "burada", "burun", "buyurmak", "buz", "buzdolab??", "b??ro", "b??t??n", "b??y??k", "C", "cadde", "cami", "can", "canl??", "ceket", 
    "cennet", "cep", "cevap", "cins", "cuma", "cumartesi", "cumhuriyet", "??", "??abuk", "??a????rmak", "??al????kan", "??al????ma", "??al????mak", "??almak", "??anta", 
    "??arpmak", "??ar??amba", "??ar????", "??atal", "??ay", "??ekmek", "??e??it", "??evirmek", "??eyrek", "????karmak", "????kmak", "??i??ek", "??iftlik", "??ikolata", "??irkin", 
    "??ocuk", "??ok", "??orap", "??orba", "????nk??", "D", "da", "da??", "daha", "daima", "daire", "dakika", "daktilo", "dans", "dar", 
    "davet", "dede", "defa", "defter", "de??er", "de??il", "de??????ik", "de??i??mek", "delik", "demek", "denemek", "deniz", "derece", "derhal", "derin", 
    "ders", "dert", "deva", "devir", "devlet", "deyim", "d????", "d????ar??", "di??er", "dikkat", "dikmek", "dil", "dilemek", "dinlemek", "di??", 
    "do??mak", "do??ru", "do??u", "do??um", "doksan", "doktor", "dokuz", "dolap", "dola??mak", "dolmak", "dolmu??", "dolu", "domates", "dondurma", "dost", 
    "doymak", "d??nmek", "d??n????", "d??rt", "d??vmek", "dudak", "durak", "durmak", "durum", "du??", "duvar", "duygu", "duymak", "d??????n", "d??kk??n", 
    "d??n", "d??nya", "d????mek", "d??????nmek", "d??z", "E", "eczane", "efendi", "e??er", "e??lence", "e??lenmek", "ek", "ekim", "ekmek", "eksik", 
    "ek??i", "el", "elbette", "elbise", "elektrik", "elli", "elma", "emekli", "emin", "emir", "en", "enerji", "erkek", "erken", "ertesi", 
    "eser", "eski", "e??", "e??ya", "et", "etek", "etmek", "etraf", "ev", "evet", "evlenmek", "evli", "evvel", "evvel", "eylem", 
    "eyl??l", "F", "fabrika", "faiz", "fakat", "fakir", "fak??lte", "fark", "fayda", "fazla", "fel??ket", "fena", "f??r??alamak", "f??r??n", "fiil", 
    "fikir", "film", "fincan", "fiyat", "foto??raf", "G", "galiba", "garson", "gazete", "gazeteci", "gazino", "gece", "ge??", "ge??en", "ge??irmek", 
    "ge??it", "ge??mek", "gelecek", "gelin", "geli??mek", "gelmek", "gemi", "gen??", "gene", "genellikle", "geni??", "ger??ek", "gerek", "gerekmek", "geri", 
    "getirmek", "gezmek", "gibi", "gidi??", "giri??", "girmek", "gi??e", "gitmek", "giyinmek", "giymek", "g??????s", "g??k", "g??l", "g??mlek", "g??ndermek", 
    "g??re", "g??rev", "g??rmek", "g??r????mek", "g??stermek", "g??t??rmek", "g??z", "g??zl??k", "gram", "g????", "g??l", "g??lmek", "g??n", "g??nayd??n", "g??ne??", 
    "g??ney", "g??nl??k", "????", "g??r??lt??", "g??zel", "H", "haber", "hafta", "hak", "hakikaten", "hakl??", "hal", "halbuki", "hal??", "halk", 
    "hangi", "han??m", "han??mefendi", "hani", "hareket", "harita", "harp", "hasta", "hastabak??c??", "hastane", "hat", "hat??rlamak", "hava", "hayat", "haydi", 
    "hay??r", "hayvan", "haz??r", "haz??rlamak", "haziran", "h??l??", "hediye", "hele", "hem", "hemen", "hen??z", "Mehmet", "hep", "her", "herhalde", 
    "herkes", "hesap", "heyecan", "h??rs??z", "h??z", "hi??", "hissetmek", "hoca", "ho??", "h??k??met", "I", "??s??rmak", "??smarlamak", "??????k", "i??", 
    "i??eri", "i??in", "i??ki", "i??mek", "idare", "ihtiya??", "ihtiyar", "iki", "iktisadi", "ila??", "il??n", "ile", "ileri", "ilgin??", "ilk", 
    "ilkbahar", "imza", "imzalamak", "inanmak", "inmek", "insan", "in??allah", "ise", "isim", "iskemle", "istasyon", "istek", "istemek", "i??", "i????i", 
    "i??itmek", "i??te", "itmek", "iyi", "iyilik", "izin", "izlemek", "J", "jeton", "K", "kabul", "ka??", "ka??mak", "kadar", "kad??n", 
    "kahvalt??", "kahve", "kahverengi", "kalabal??k", "kald??rmak", "kale", "kalem", "kal??n", "kalkmak", "kalmak", "kalorifer", "kan", "kanun", "kapal??", "kapamak", 
    "kap??", "kap??c??", "kar", "kara", "karakol", "karanl??k", "karar", "karde??", "kar??", "kar??n", "kar??????k", "kar????mak", "kar????", "kar????lamak", "kasaba", 
    "kasap", "kas??m", "ka??", "ka????k", "kat", "kat??", "kavga", "kavun", "kaybetmek", "kaynak", "kazan", "kazan??", "kazanmak", "k??????t", "k??r", 
    "k??tip", "kebap", "kedi", "kendi", "kent", "kere", "kesmek", "keyif", "k??rk", "k??rmak", "k??rm??z??", "k??sa", "k??s??m", "k????", "k??y??", 
    "k??yma", "k??z", "k??z??l", "k??zmak", "kibrit", "kilim", "kilo", "kilometre", "kim", "kimse", "kira", "kirli", "ki??i", "kitap", "koca", 
    "kol", "kolay", "koltuk", "kom??u", "konferans", "konser", "konsolos", "konu??mak", "korkmak", "ko??mak", "koymak", "koyu", "koyun", "k??fte", "k??m??r", 
    "k??pek", "k??pr??", "k??r", "k????e", "k??t??", "k??y", "k??yl??", "kulak", "kullanmak", "kum", "kuma??", "kurmak", "kurtarmak", "kuru??", "ku??", 
    "kutlamak", "kutu", "kuvvet", "kuzey", "k??????k", "k??t??phane", "L", "lamba", "l??z??m", "limon", "lira", "lise", "lokanta", "l??tfen", "l??zum", 
    "M", "maalesef", "madem", "maden", "mahalle", "makina", "mal", "manav", "manzara", "mart", "masa", "ma??allah", "mavi", "may??s", "m??na", 
    "meclis", "mektep", "mektup", "memleket", "memnun", "memur", "mendil", "merak", "merdiven", "merhaba", "merkez", "mersi", "mesele", "meslek", "me??gul", 
    "me??hur", "metre", "mevsim", "mevzu", "meydan", "meyve", "millet", "mill??", "milyar", "milyon", "mimar", "minare", "misafir", "mor", "musluk", 
    "mutfak", "mutlaka", "mutlu", "m??ddet", "m??d??r", "m??hendis", "m??him", "m??mk??n", "m??racaat", "m??saade", "m??ze", "m??zik", "N", "nas??l", "ne", 
    "neden", "nerede", "nereli", "nereye", "ni??in", "nihayet", "nisan", "niye", "niyet", "niyet", "normal", "not", "numara", "numara", "nutuk", 
    "nutuk", "O", "ocak", "oda", "odac??", "odun", "ofis", "o??lan", "o??ul", "okul", "okumak", "olmak", "omuz", "on", "opera", 
    "ordu", "orman", "orta", "otel", "otob??s", "otomobil", "oturmak", "otuz", "oynamak", "oyun", "??", "??b??r", "??demek", "??dev", "????le", 
    "????renci", "????renmek", "????retim", "????retmek", "????retmen", "??l??mek", "??l????", "??lmek", "??l??m", "??m??r", "??n", "??nce", "??nem", "??nemli", "??pmek", 
    "??yle", "??zel", "??z??r", "P", "pahal??", "paket", "palto", "pansiyon", "pantalon", "para", "par??a", "park", "parlak", "parmak", "pasaport", 
    "pasta", "pastane", "patates", "patron", "pazar", "pazartesi", "pek", "peki", "pembe", "pencere", "perde", "per??embe", "peynir", "piknik", "pilav", 
    "pis", "pi??irmek", "pi??mek", "plaj", "polis", "politika", "portakal", "posta", "postane", "profes??r", "program", "pul", "R", "radyo", "raf", 
    "ra??men", "rahat", "rak??", "randevu", "re??el", "renk", "renkli", "resim", "resm??", "ressam", "rica", "r??zg??r", "S", "saat", "sabah", 
    "sa??", "sade", "sa??", "sa??l??k", "saha", "sahi", "sahip", "sak??n", "salata", "sal??", "salon", "sanayi", "sandalye", "saniye", "sanki", 
    "sanmak", "sar??", "sat??c??", "sat??n", "satmak", "sava??", "sayfa", "saymak", "sebep", "sebze", "se??mek", "sefer", "sekiz", "sekreter", "seksen", 
    "sel??m", "sen", "sene", "serbest", "sergi", "serin", "sert", "ses", "sevgili", "sevin??", "sevinmek", "sevmek", "seyahat", "seyretmek", "s??cak", 
    "s??f??r", "s??k", "s??kmak", "s??n??f", "s??r", "s??ra", "sigara", "sinema", "siyah", "siz", "so??an", "so??uk", "sohbet", "sokak", "sol", 
    "son", "sonbahar", "sonra", "sormak", "soru", "sorun", "soyad??", "s??ylemek", "s??z", "s??zl??k", "spor", "su", "subay", "sultan", "susmak", 
    "s??rmek", "s??t", "??", "??air", "??apka", "??arap", "??ark", "??art", "??a????rmak", "??a??mak", "??ehir", "??eker", "??ekerli", "??emsiye", "??ey", 
    "??ik??yet", "??imdi", "??irket", "??i??", "??i??e", "??i??man", "??of??r", "????yle", "??u", "??ubat", "????phe", "T", "tabak", "tabii", "tahsil", 
    "tahta", "tak??m", "taksi", "tam", "tamam", "tane", "tan??mak", "tan????mak", "tanr??", "taraf", "tarif", "tarih", "tarla", "ta??", "ta????mak", 
    "ta????nmak", "tatil", "tatl??", "tavuk", "taze", "tebrik", "tehlike", "tek", "teklif", "tekrar", "tekrarlamak", "telefon", "televizyon", "telgraf", "tembel", 
    "temiz", "temizlemek", "temmuz", "temsil", "tepe", "tercih", "terzi", "te??ekk??r", "t??rnak", "ticaret", "tiyatro", "top", "toplamak", "toplant??", "toprak", 
    "tramway", "tra??", "tren", "tuhaf", "turist", "turistik", "turuncu", "tutmak", "tuvalet", "tuz", "tuzlu", "t??rl??", "t??t??n", "U", "ucuz", 
    "u??ak", "u??mak", "ufak", "u??ramak", "ulus", "ummak", "umumiyetle", "unutmak", "uyanmak", "uygun", "uyku", "uyumak", "uzak", "uzatmak", "uzun", 
    "??", "????", "??lke", "??mit", "??niversite", "??nl??", "??st", "??t??", "??ye", "??zere", "??zmek", "??z??lmek", "??z??m", "V", "vakit", 
    "vali", "valiz", "vapur", "var", "varmak", "vatan", "vatanda??", "vazge??mek", "vazife", "vaziyet", "ve", "vermek", "veya", "vurmak", "Y", 
    "ya", "yabanc??", "ya??", "ya??mak", "ya??mur", "yahut", "yak??n", "yak??t", "yakmak", "yalan", "yaln??z", "yan", "yanak", "yani", "yanl????", 
    "yanmak", "yapmak", "yaprak", "yard??m", "yar??", "yar??m", "yar??n", "yasak", "ya??", "ya??amak", "ya??l??", "yatak", "yatmak", "yava??", "yavru", 
    "yaz", "yaz??", "yaz??k", "yazmak", "yedi", "yemek", "yeni", "yer", "ye??il", "yeti??mek", "yetmek", "yetmi??", "y??kamak", "y??kanmak", "y??l", 
    "yine", "yirmi", "yiyecek", "yo??urt", "yok", "yoksa", "yol", "yolcu", "yolculuk", "yollamak", "yorgun", "yorulmak", "y??n", "y??netici", "yukar??", 
    "yumurta", "yumu??", "yurt", "y??ksek", "y??kselmek", "y??r??mek", "y??z", "y??zmek", "Z", "zahmet", "zaman", "zamir", "zarf", "zaten", "zengin"    
];

const godsVocabularyLithuanian = [
    "kaip", "A??", "jo", "kad", "jis", "buvo", "u??", "nuo", "yra", "su", "jie", "b??ti", "prad??jo", "vienas", "tur??ti", "tai", 
    "nuo", "pagal", "kar??tas", "??odis", "ta??iau", "k??", "kai", "yra", "ji", "j??s", "arba", "buvo", "pamatyti", "i??", "??", 
    "ir", "gro??is", "matyti", "mes", "galima", "i??", "kitas", "buvo", "kurie", "padaryti", "j??", "laikas", "jei", "bus", "kaip", 
    "sak??", "kiekvienas", "pasakyti", "daro", "rinkinys", "trij??", "noriu", "oro", "gerai", "taip pat", "??aisti", "ma??as", "pabaiga", "sud??ti", "namai", 
    "skaityti", "rank??", "uostas", "didelis", "reik??ti", "prid??ti", "net", "??em??s", "??ia", "turi", "didelis", "auk??tas", "toks", "sekti", "aktas", 
    "kod??l", "paklausti", "vyrai", "pokytis", "nuvyko", "??viesa", "nat??ra", "nuo", "reik??ti", "namas", "nuotrauka", "pabandyti", "mums", "v??l", "gyv??nas", 
    "ta??kas", "motina", "pasaulis", "??alia", "statyti", "savaranki??kai", "??em??", "t??vas", "bet koks", "nauja", "darbas", "dalis", "imti", "gauti", "vieta", 
    "padar??", "gyventi", "kur", "po", "atgal", "ma??ai", "tik", "turas", "vyras", "metai", "at??jo", "??ou", "kiekvienas", "geras", "mane", 
    "duoti", "m??s??", "pagal", "pavadinimas", "labai", "per", "tiesiog", "forma", "sakinys", "puikus", "galvoti", "pasakyti", "pad??ti", "??emas", "linija", 
    "skiriasi", "pos??kis", "prie??astis", "daug", "rei??kia", "prie??", "Perkelti", "teis??", "berniukas", "senas", "taip pat", "tas pats", "ji", "visi", "ten", 
    "kai", "?? vir????", "naudoti", "savo", "b??das", "apie", "daug", "tada", "jiems", "ra??yti", "b??t??", "kaip", "taip", "tai", "jos", 
    "ilgai", "padaryti", "dalykas", "pamatyti", "j??", "du", "turi", "??i??r??ti", "daugiau", "dien??", "gal??t??", "eiti", "ateiti", "padar??", "skai??ius", 
    "garso", "ne", "dauguma", "??mon??s", "mano", "per", "??inoti", "vanduo", "nei", "kvietimas", "pirmas", "kas", "gali", "??emyn", "pus??", 
    "buvo", "dabar", "rasti", "vadovas", "stov??ti", "savo", "puslapis", "tur??t??", "??alis", "rasti", "atsakymas", "mokykla", "augti", "tyrimas", "dar", 
    "su??inoti", "augal??", "dangtis", "maistas", "saul??", "keturi", "tarp", "valstyb??s", "i??laikyti", "aki??", "niekada", "paskutinis", "tegul", "mintis", "miestas", 
    "medis", "kirsti", "??kis", "sunku", "prad??ia", "might", "istorija", "pj??klas", "toli", "j??ra", "atkreipti", "?? kair??", "v??lai", "paleisti", "n??ra", 
    "o", "paspauskite", "arti", "naktis", "tikras", "gyvenimas", "ma??ai", "?? ??iaur??", "knyga", "vykdyti", "pa??m??", "mokslas", "valgyti", "kambario", "draugas", 
    "prad??jo", "id??ja", "??uvis", "kalnas", "sustabdyti", "kart??", "baz??", "i??girsti", "arklys", "supjaustyti", "tikrai", "??i??r??ti", "spalva", "veido", "medienos", 
    "pagrindinis", "atvira", "atrodo", "kartu", "kitas", "baltas", "vaikai", "prad??ti", "turiu", "vaik????ioti", "pavyzdys", "palengvinti", "popieriaus", "grup??", "visada", 
    "muzika", "tie", "abu", "??enklas", "da??nai", "lai??kas", "iki", "myli??", "up??s", "automobili??", "p??d??", "prie??i??ra", "antra", "pakankamai", "paprastas", 
    "mergina", "??prasta", "jauna", "pasiruo????s", "auk????iau", "kada nors", "raudonas", "s??ra??as", "nors", "jausti", "aptarimas", "pauk??tis", "grei??iau", "k??nas", "??uo", 
    "??eima", "tiesiogiai", "kelti", "palikti", "daina", "matuoti", "durys", "produktas", "juodas", "trumpas", "skaitvardis", "klas??", "v??jas", "klausimas", "atsitikti", 
    "pilnas", "laivas", "plotas", "pus??", "rokas", "kad", "gaisro", "?? pietus", "problema", "gabalas", "sak??", "??inojo", "pereiti", "nuo", "vir??us", 
    "visas", "karalius", "gatv??s", "colis", "daugintis", "nieko", "??inoma", "likti", "rat??", "pilnas", "j??ga", "m??lynas", "objektas", "nuspr??sti", "pavir??ius", 
    "giliai", "m??nulis", "sala", "p??da", "sistema", "u??imtas", "testas", "??ra??as", "valtis", "bendras", "aukso", "galimas", "l??ktuvas", "sodyba", "sausas", 
    "nenuostabu", "juokas", "t??kstan??i??", "prie??", "Arklys", "patikrinti", "??aidimas", "forma", "prilygti", "kar??tas", "praleisti", "atne????", "??ilumos", "sniego", "padanga", 
    "atne??ti", "taip", "tolimas", "u??pildyti", "?? rytus", "da??ai", "kalba", "tarp", "vienetas", "galia", "miestas", "gerai", "tikras", "skristi", "patenka", 
    "vadovauti", "??auksmas", "tamsus", "ma??ina", "pastaba", "laukti", "planas", "fig??ra", "??vaig??d??", "d????ut??", "daiktavardis", "srityje", "poilsio", "teisingas", "sugeb??ti", 
    "svaras", "padirbtas", "gro??is", "vairuoti", "stov??jo", "b??ti", "priekinis", "mokyti", "savait??", "galutinis", "dav??", "??alia", "oh", "greitai", "pl??toti", 
    "vandenynas", "??iltas", "nemokamai", "minu??i??", "stiprus", "ypating??", "protas", "u??", "ai??ku", "uodega", "gaminti", "faktas", "vietos", "gird??jau", "geriausias", 
    "valandos", "geriau", "tiesa", "metu", "??imtai", "penki", "prisiminti", "??ingsnis", "anksti", "palaikykite", "vakar??", "??em??s", "pal??kanos", "pasiekti", "greitai", 
    "veiksma??odis", "dainuoti", "klausyti", "??e??i??", "lentel??", "kelion??", "ma??iau", "rytas", "de??imt", "paprastas", "kelis", "balsis", "link", "karas", "pad??ti", 
    "prie??", "modelis", "l??tai", "centras", "patinka", "asmuo", "pinigai", "tarnauti", "pasirodyti", "keli??", "??em??lapis", "lietus", "taisykl??", "reglamentuoja", "traukti", 
    "??altas", "prane??imas", "balsas", "energija", "med??iokl??", "tik??tina", "lova", "brolis", "kiau??inis", "va??in??ti", "l??stel??", "tik??ti", "galb??t", "pasirinkti", "staiga", 
    "skai??iuoti", "aik??t??", "prie??astis", "ilgis", "atstovauti", "menas", "tema", "regionas", "dydis", "skirtis", "atsiskaityti", "kalb??ti", "svoris", "bendras", "ledas", 
    "nesvarbu", "ratas", "pora", "??traukti", "takoskyra", "skiemuo", "jau??iamas", "didysis", "kamuoliukas", "dar", "banga", "la??as", "??irdis", "pm", "metu", 
    "sunkus", "??okis", "variklis", "pozicija", "ranka", "plo??io", "bur??", "med??iaga", "frakcija", "mi??kas", "s??d??ti", "var??ybos", "langas", "parduotuv??", "vasara", 
    "traukinys", "miegas", "??rodyti", "vieni??as", "koja", "pratimas", "sienos", "laimikis", "kalno", "nor??ti", "dangus", "lenta", "d??iaugsmas", "??iema", "sat", 
    "para??yta", "laukinis", "priemon??", "laikomi", "stiklas", "??ol??", "karv??", "darbas", "kra??tas", "??enklas", "apsilankymas", "praeitis", "mink??tas", "malonumas", "??viesus", 
    "dujos", "oras", "m??nes??", "milijonas", "b??ti", "apdaila", "laimingas", "tikiuosi", "g??l??", "aprengti", "keista", "dingo", "prekyba", "melodija", "Kelion??s", 
    "biuras", "gauti", "eil??", "burna", "tikslus", "simbolis", "mirti", "ma??iau", "b??da", "??aukti", "i??skyrus", "ra????", "s??klos", "tonas", "prisijungti", 
    "pasi??lyti", "??varus", "pertrauka", "panele", "kiemas", "padid??s", "blogas", "sm??gis", "alyva", "kraujo", "paliesti", "augo", "centas", "mai??yti", "komanda", 
    "vielos", "kaina", "prarado", "rudi", "d??v??ti", "sodas", "lyg??s", "siun??iami", "pasirinkti", "suma????jo", "tinka", "tek??ti", "s????ininga", "bankas", "rinkti", 
    "i??saugoti", "valdymas", "de??imtainis", "ausis", "kitas", "gana", "sumu????", "atveju", "vidurys", "nu??udyti", "s??nus", "e??eras", "akimirka", "skal??", "garsiai", 
    "pavasaris", "steb??ti", "vaikas", "tiesiai", "priebalsis", "tauta", "??odynas", "pienas", "greitis", "metodas", "organas", "mok??ti", "am??ius", "skyrius", "suknel??", 
    "debesis", "staigmena", "ramus", "akmuo", "ma??ytis", "lipti", "kietas", "dizainas", "prastas", "daug", "eksperimentas", "apa??ia", "raktas", "gele??ies", "vieno", 
    "Stick", "butas", "dvide??imt", "oda", "??ypsena", "rauk??l??tis", "skyl??", "??uolis", "k??dikis", "a??tuoni", "kaimas", "patenkinti", "??aknis", "pirkti", "pakelti", 
    "i??spr??sti", "metalo", "ar", "stumti", "septyni", "punktas", "tre??ia", "turi", "rankin??", "plaukai", "apib??dinti", "vir??jas", "auk??tas", "arba", "rezultatas", 
    "deginti", "kalnas", "saugus", "kat??", "am??ius", "apsvarstyti", "tipas", "teis??", "tiek", "pakrant??", "kopija", "fraz??", "tylus", "auk??tas", "sm??lio", 
    "dirvo??emis", "ritinys", "temperat??ra", "pir??tas", "pramon??", "vert??", "kova", "melas", "??veikti", "su??adinti", "nat??ralus", "vaizdas", "jausmas", "kapitalas", "nebus", 
    "k??d??", "pavojus", "vaisiai", "turtingas", "storas", "Eilinis", "procesas", "veikia", "praktika", "atskiras", "sunkus", "gydytojas", "Pra??om", "apsaugoti", "vidurdienis", 
    "pas??li??", "modernus", "elementas", "nukent??jo", "studentas", "kampas", "??alis", "tiekimas", "kurio", "rasti", "??iedas", "charakteris", "vabzd??i??", "sugauti", "laikotarpis", 
    "rodo", "radijo", "kalb??jo", "atomas", "??mogaus", "istorija", "poveikis", "elektros", "tik??tis", "kaulas", "gele??inkeli??", "??sivaizduoti", "teikti", "susitarti", "taip", 
    "??velnus", "moteris", "kapitonas", "atsp??ti", "reikalingas", "a??trus", "sparnas", "kurti", "kaimynas", "skalbimas", "bat", "gana", "minia", "kukur??zai", "palyginti", 
    "eil??ra??tis", "styga", "varpas", "priklauso", "m??sa", "rubli??", "vamzdis", "garsus", "doleris", "srautas", "baim??", "reginys", "plonas", "trikampis", "planeta", 
    "skub??ti", "vyriausiasis", "kolonija", "laikrodis", "mano", "kaklarai??tis", "??eiti", "pagrindinis", "??vie??i", "paie??ka", "si??sti", "geltonas", "pistoletas", "leisti", "Spausdinti", 
    "mir??s", "vieta", "dykuma", "kostiumas", "dabartinis", "keltuvas", "ro????", "atvykti", "meistras", "takelis", "t??v??", "kranto", "skyrius", "lapas", "med??iaga", 
    "pirmenyb??", "prisijungti", "prane??imas", "praleisti", "styga", "riebal??", "malonu", "originalus", "dalis", "stotis", "t??tis", "duona", "imti", "tinkamas", "baras", 
    "pasi??lymas", "segmentas", "vergas", "antis", "momentinis", "rinka", "laipsnis", "u??pildyti", "jaunikl??", "brangusis", "prie??as", "atsakin??ti", "g??rimas", "atsirasti", "parama", 
    "kalbos", "pob??dis", "diapazonas", "garo", "pasi??lymas", "kelias", "skystis", "prisijungti", "rei??kia", "dalmuo", "dantys", "apvalkalas", "kaklas", "deguonies", "cukraus", 
    "mirtis", "gana", "??g??d??i??", "moterys", "sezonas", "sprendimas", "magnetas", "sidabras", "a??i??", "filialas", "rungtyn??s", "priesaga", "ypa??", "pav", "bijau", 
    "did??iulis", "sesuo", "plieno", "aptarti", "pirmyn", "pana??us", "vadovas", "patirtis", "rezultatas", "obuoli??", "nusipirkau", "l??m??", "pikis", "kailis", "mas??", 
    "kortel??", "grup??", "virv??s", "slydimo", "laim??ti", "svajon??", "vakaras", "s??lyga", "pa??arai", "priemon??", "visas", "pagrindinis", "kvapas", "sl??nis", "nei", 
    "dvigubai", "s??dyn??", "toliau", "blokas", "schema", "skryb??l??", "parduoti", "s??km??", "??mon??", "atimti", "renginys", "pirma", "spr??sti", "plaukti", "terminas", 
    "prie??ais", "??mona", "bat??", "petys", "plitimas", "susitarti", "stovykla", "sugalvoti", "medviln??s", "Gim??", "nustatyti", "kvorta", "devyni", "sunkve??imis", "triuk??mas", 
    "lygis", "tikimyb??", "surinkti", "parduotuv??", "ruo??as", "mesti", "valymo", "turtas", "stulpelis", "molekul??", "pasirinkti", "negerai", "pilka", "pakartokite", "reikalauti"
];

const godsVocabulary = [
    "African", "Angel", "BBC", "BRB", "Bam", "Boo", "Burp", "CIA", "California", "Catastrophic Success", "China", "Church", 
    "Cosmos", "Dad", "Dudly Doright", "FBI", "GarryKasparov", "Ghost", "Give me praise", "God", "God is not mocked", "God smack", 
    "Greece", "Greek to me", "Han shot first", "Hasta", "Heaven", "Hicc up", "HolySpirit", "I'll ask nicely", "I'll be back", 
    "I'll get right on it", "I'll let you know", "I'll think about it", "I'm God and you're not", "I'm God who the hell are you", 
    "I'm beginning to wonder", "I'm bored", "I'm busy", "I'm done", "I'm feeling nice today", "I'm gonna smack someone", 
    "I'm good you good", "I'm grieved", "I'm impressed", "I'm in suspense", "I'm not dead yet", "I'm not sure", "I'm off today", 
    "I'm on a roll", "I'm the boss", "I'm thrilled", "I'm tired of this", "IMHO", "I am not amused", "I be like", "I can't believe it", 
    "I could be wrong", "I could swear", "I didn't do it", "I didn't see that", "I don't care", "I donno", "I forgot", "I give up", "I got your back", 
    "I had a crazy dream", "I hate when that happens", "I have an idea", "I just might", "I love this", "I love you", "I made it that way", 
    "I pity the fool", "I planned that", "I quit", "I see nothing", "I veto that", "I was just thinking", "I was sleeping", "Icarus", 
    "If had my druthers", "Is that so", "Is that your final answer", "Isn't that special", "It's nice being God", "It grieves me", 
    "Ivy league", "Japan", "Jedi mind trick", "Jesus", "King Midas", "Knock you upside the head", "LOL", "Make America Great Again", 
    "Mars", "Mission Accomplished", "Mom", "Moses", "NOT", "NeilDeGrasseTyson", "Trump", "Oh Hell No", "Oh really", "Okilydokily", 
    "One finger salute", "Oy", "Pope", "Putin", "Pullin the dragons tail", "ROFLMAO", "Russia", "Shakespeare", "Shalom", "Shhh", 
    "StephenHawking", "SupremerCourt", "Terry", "That's gonna leave a mark", "That's my favorite", "The good stuff", "This is confusing", 
    "Varoom", "Vegas", "Venus", "Watch this", "What", "What I want", "What are you doing Dave", "WooHoo", "Wow", "Yawn", "Yes you are", 
    "Yo", "You can count on that", "You da man", "You fix it", "You get what you pray for", "You know", "Zap", "Zzzzzzzz", "a flag on that play", 
    "a likely story", "a screw loose", "abnormal", "absetively posilutely", "absolutely", "act", "adjusted for inflation", "adultery", "after a break", 
    "ahh", "ahh thats much better", "air head", "and the award goes to", "and then what", "angel", "anger", "application", "are you deaf", 
    "are you feeling lucky", "are you insane", "are you sure", "arent you clever", "arrogant", "as a matter of fact", "astounding", 
    "astronomical", "astrophysics", "atheist", "atrocious", "au revoir", "awesome", "awful", "ba ha", "bad", "bad ol puddytat", 
    "baffling", "bank", "basically", "basket case", "bastard", "battle", "be happy", "be quiet bird", "beam me up", "because I said so", 
    "beep beep", "begs the question", "bickering", "big fish", "biggot", "birds", "bizarre", "blessing", "boink", "boss", "break some woopass on you", 
    "bring it on", "bummer", "busybody", "but of course", "by the way", "bye", "can you hear me now", "car", "catastrophe", "caution", 
    "chaos", "charged", "charity", "check this out", "cheerful", "chess", "chill", "chill out", "choose one", "chump change", "church", 
    "class  class  shutup", "clever", "climate", "close your eyes", "come and get me", "comedy", "commanded", "completely", "computers", "conservative", 
    "cosmetics", "could it be   Satan", "couldn't be better", "couldnt possibly", "courage", "cowardice", "cracks me up", 
    "crash and burn", "crazy", "cursing", "dance", "dang it", "daunting", "dean scream", "debt", "delicious", "delightful", 
    "depressing", "desert", "didn't I say that", "dignity", "do I have to", "do it", "do not disturb", "do over", "do you get a cookie", 
    "do you have a problem", "do you know what time it is", "do you like it", "do you want another", "doh", "don't count on it", 
    "don't even think about it", "don't have a cow", "don't mention it", "don't push it", "don't worry", "downer", "drama", "driving", 
    "duck the shoe", "dude such a scoffer", "earnest", "economy", "eh", "ehh a wise guy", "ehheh that's all folks", "employee", 
    "employer", "end", "endeared", "endeavor", "endure", "energy", "enough", "enough said", "envy", "epic fail", "et tu", 
    "everything's a okay", "evolution", "exorbitant", "experts", "exports", "fabulous", "face palm", "failure is not an option", 
    "failure to communicate", "fake", "fancy", "far out man", "fer sure", "fight", "figuratively", "food", "fool", "fortitude", 
    "foul", "freak", "frown", "fun", "funny", "furious", "gambling", "game changer", "game over", "geek", "genius", "ghastly", "ghetto", 
    "glam", "glorious", "gluttony", "go ahead make my day", "good", "Good... Go-ood... dog...", "gosh", "gross", "grumble", "guilty", 
    "guppy", "ha", "handyman", "hang in there", "happy", "happy happy joy joy", "hard working", "harder than it looks", "hate", "have fun", 
    "he be like", "heads I win tails you lose", "heathen", "hello", "here now", "hey Mikey he likes it", "hey thats right", "hi", "high five", 
    "high mucky muck", "hilarious", "hippy", "hit", "ho ho ho", "hobnob", "hold on a minute", "holier than thou", "holy grail", "home", 
    "homo", "honestly", "honesty", "hooah", "hope", "hopefully", "horrendous", "hot air", "hotel", "how's the weather", "how about", 
    "how about that", "how about those yankees", "how bout it", "how come", "how could you", "how do I put this", "how goes it", 
    "how hard could it be", "how high", "huh", "humility", "humongous", "hurts my head", "husband", "hypocrite", "ice cream", "if and only if", 
    "if anything can go wrong", "illogical", "imports", "impossible", "in a galaxy far far away", "in a perfect world", "in other words", 
    "in practice", "in theory", "incoming", "incredibly", "industrious", "ingrate", "insane", "ipod", "is it just me or", "it'd take a miracle", 
    "it's hopeless", "it's my world", "it figures", "it gets better", "it was nothing", "jealousy", "job", "jobs", "joke", "joker", 
    "joking", "joy", "joyful", "just between us", "just lovely", "kick back", "kludge", "later", "laziness", "left field", "let's roll", 
    "let's see", "let me count the ways", "liberal", "lift", "lighten up", "like like", "listen buddy", "little buddy", "little fish", 
    "look buddy", "look on the brightside", "look out", "love", "lulz", "lust", "lying", "make my day", "manufacturing", "maybe I didn't make it clear", 
    "meek", "meh", "merry christmas", "middle class", "mine", "mission from God", "mocking", "money", "mundo stoked", "music", "my bad", 
    "my precious", "na na", "nasty", "naughty", "nerd", "nevada", "never happy", "news to me", "no more", "no more tears", "no news is good news", 
    "no way dude", "no you cant", "nope", "not", "not a chance in hell", "not good", "not in kansas anymore", "not in my wildest dreams", 
    "not that theres anything wrong", "not the sharpest knife in the drawer", "not too shabby", "now that I think about it", "now you tell me", 
    "nut job", "obviously", "off the record", "oh come on", "oh my", "oh no", "oh oh", "ohh thank you", "oil", "okay", "on occassion", 
    "on the otherhand", "once upon a time", "one more time", "one small step", "oops", "ordinarily", "other", "ouch", "outrageous", 
    "over the top", "overflow", "pardon the french", "patience", "peace", "perfect", "persistence", "pet", "petty", "phasors on stun", 
    "pick me pick me", "piety", "place", "play", "poor", "population", "potentially", "pow", "praise", "praying", "pride", "programming", 
    "prosperity", "pwned", "qed", "quit", "quit it", "quite", "radio", "really", "recipe", "refreshing", "relax", "repeat after me", "repent", 
    "resume", "reverse engineer", "revolution", "rich", "ridiculous", "rip off", "rocket science", "rose colored glasses", "roses are red", 
    "rubbish", "run away", "saber rattling", "sad", "scorning", "scum", "segway", "service sector", "services", "sess me", "sex", "shist", 
    "shucks", "silly human", "sing", "skills", "sky", "sloth", "slumin", "smack some sense into you", "small talk", "smart", "smile", "smurfs", 
    "snap out of it", "so he sess", "so let it be done", "so let it be written", "soap opera", "special case", "spending", "spirit", "spoiled brat", 
    "sports", "spunky", "stoked", "straighten up", "strip", "study", "stuff", "stunning", "super computer", "surprise surprise", "take the day off", 
    "take your pick", "talk to my lawyer", "tattle tale", "taxes", "test pilot", "thank you very much", "that's all folks", "that's for me to know", 
    "that's much better", "that's no fun", "that's your opinion", "thats just wrong", "thats laughable", "thats right", "the", "the enquirer", 
    "the Serbians are an abomination", "theft", "theres no place like home", "these cans are defective", "think you could do better", 
    "this might end badly", "threads", "tiffanies",  "to infinity and beyond", "tomorrow", "tree hugger", "try again", "uh huh", "umm", 
    "umm the other answer", "umm what now", "unemployment", "unsung hero", "vengeance", "vengeful", "vermin", "vice", "virtue", "voodoo", "vote", 
    "walking", "wanna bet", "wastoid", "watch it buddy", "wazz up with that", "we ve already got one", "well I never", "well golly", "well obviously", 
    "whale", "what's it to you", "what's the plan", "what's up", "what a mess", "what a nightmare", "what do you expect", "what do you want", 
    "what have you done for me lately", "what luck", "what part of God do you not understand", "what planet are you from", "what the heck", 
    "what was I thinking", "what would Jesus do", "whatcha talkin' 'bout", "whazza matter for you", "when hell freezes over", "where's the love", 
    "whiner", "white trash", "who's to say", "who are you to judge", "whoop there it is", "why didn' you tell me", "why do I put up with this", 
    "why is it", "wishful thinking", "won't you be my neighbor", "wonderbread", "wonderful", "woot", "wot", "wrath", "yada yada yada", "yeah", 
    "yep", "yikes", "you'll see", "you're fired", "you're in big trouble", "you're lucky", "you're no fun", "you're not all there are you", 
    "you're nuts", "you're out of your mind", "you're so screwed", "you're welcome", "you're wonderful", "you are my sunshine", "you better not", 
    "you do it", "you don't like it", "you don't say", "you hoser", "you know a better God", "you never know", "you owe me", "you see the light", 
    "you should be so lucky", "you shouldn't have", "you talkin' to me", "you think I'm joking", "you think you could do better", "yuck", "zoot", 
    "red fang", "rum bitty di", "I m prettier than this man", "This cant be william wallace", "got the life", "king nun", "king of mars", 
    "an Irishman is forced to talk to God", "you couldnt navigate yer way circleK", "its trivial obviously", "rufus!"
];
const godsPunctuation = ['?', '.', '!', ',', ';', '???'];

function getRandomInterval(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function getRandomIndex(max) {
    return getRandomInterval(0, max);
}

// 0: english, 1: lithuanian, 2: turkish, 3: hawaiian
function generateWordGod(language = 0) {
    let passage = '';

    // God only wishes to speak between 24 and 48 words at a time
    let maxWords = getRandomInterval(24, 48);
    const minWordsForPunct = 3;

    // God must pick between English, Lithuanian
    let length_of_vocab = 0;
    switch (language) {
        case 0:
            length_of_vocab = godsVocabulary.length;
            break;
        case 1:
            length_of_vocab = godsVocabularyLithuanian.length;
            break;
        case 2:
            length_of_vocab = godsVocabularyTurkish.length;
            break;
        case 3:
            length_of_vocab = godsVocabularyHawaiian.length;
            break;
    }

    // God decides to punctuate, or not at all. Only He governs over that
    // decision
    let godPunctuateAt = getRandomInterval(minWordsForPunct, 48);

    for (let i = 0; i < maxWords; i++) {
        if (i % godPunctuateAt == 0 && i > 0) {
            // Yes, my lord. Thine punctuation is being added
            let punctuationIdx = getRandomIndex(godsPunctuation.length);
            passage += `${godsPunctuation[punctuationIdx]}`;

            // God may decide when to punctuate again. That's not up 
            // to us mere mortals
            if ((maxWords - i) > minWordsForPunct) {
                godPunctuateAt = getRandomInterval(minWordsForPunct, (48 - i));
            }
        }

        let wordIdx = getRandomIndex(length_of_vocab);
        let newWord = ''
        switch (language) {
            case 0:
                newWord = godsVocabulary[wordIdx];
                break;
            case 1:
                newWord = godsVocabularyLithuanian[wordIdx];
                break;
            case 2:
                newWord = godsVocabularyTurkish[wordIdx];
                break;
            case 3:
                newWord = godsVocabularyHawaiian[wordIdx];
                break;
        }
        passage += ` ${newWord}`;
    }

    let godsWord = document.getElementById('div-gods-word');
    godsWord.innerText = passage;
}
