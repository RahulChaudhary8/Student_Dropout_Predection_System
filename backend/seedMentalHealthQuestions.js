import mongoose from "mongoose";
import dotenv from "dotenv";
import Question from "./models/Question.js";

dotenv.config();

const questions = [
["How often do you feel stressed during studies?","Rarely","Sometimes","Often","Almost always"],
["How often do you have trouble sleeping?","Rarely","Sometimes","Often","Almost always"],
["Do you find it easy to share your feelings?","Very easy","Somewhat easy","Difficult","Very difficult"],
["How frequently do you feel anxious before exams?","Rarely","Sometimes","Often","Almost always"],
["How confident are you in handling academic pressure?","Very confident","Confident","Not very confident","Not confident at all"],
["How often do you feel overwhelmed by your responsibilities?","Rarely","Sometimes","Often","Almost always"],
["How would you describe your mood most days?","Very positive","Mostly positive","Mixed","Mostly negative"],
["How often do you lose interest in activities you usually enjoy?","Never","Sometimes","Often","Almost always"],
["How easy is it to concentrate while studying?","Very easy","Mostly easy","Somewhat difficult","Very difficult"],
["How often do you feel lonely?","Rarely","Sometimes","Often","Almost always"],
["How supported do you feel by friends and family?","Very supported","Supported","Not very supported","Not supported"],
["How often do worries interfere with your sleep?","Never","Sometimes","Often","Almost always"],
["How confident are you about your future?","Very confident","Confident","Unsure","Not confident"],
["How often do you feel irritated or short-tempered?","Never","Sometimes","Often","Almost always"],
["How comfortable are you asking for help?","Very comfortable","Comfortable","Uncomfortable","Very uncomfortable"],
["How often do you feel energetic during the day?","Always","Often","Sometimes","Rarely"],
["How often do deadlines make you anxious?","Rarely","Sometimes","Often","Almost always"],
["How well can you relax after a stressful day?","Very well","Well","With difficulty","Not at all"],
["How often do you feel satisfied with your academic progress?","Always","Often","Sometimes","Rarely"],
["How safe do you feel expressing an unpopular opinion?","Very safe","Mostly safe","Unsafe","Very unsafe"],
["How often do you avoid social situations?","Never","Sometimes","Often","Almost always"],
["How often do you feel hopeful?","Always","Often","Sometimes","Rarely"],
["How difficult is it to make decisions when stressed?","Not difficult","Slightly difficult","Difficult","Very difficult"],
["How often do you feel physically tense or restless?","Never","Sometimes","Often","Almost always"],
["How often do you feel your thoughts are racing?","Never","Sometimes","Often","Almost always"],
["How much control do you feel over daily stress?","Complete control","A lot of control","Little control","No control"],
["How often do you postpone tasks because of anxiety?","Never","Sometimes","Often","Almost always"],
["How comfortable are you discussing mental health?","Very comfortable","Comfortable","Uncomfortable","Very uncomfortable"],
["How often do you feel calm during exams?","Always","Often","Sometimes","Rarely"],
["How often do you feel judged by others?","Never","Sometimes","Often","Almost always"],
["How easy is it to maintain a healthy routine?","Very easy","Easy","Difficult","Very difficult"],
["How often do you feel isolated despite being around people?","Never","Sometimes","Often","Almost always"],
["How often do you experience negative self-talk?","Never","Sometimes","Often","Almost always"],
["How often do you feel confident in exams?","Always","Often","Sometimes","Rarely"],
["How often do you feel exhausted even after rest?","Never","Sometimes","Often","Almost always"],
["How manageable are your assignments and projects?","Very manageable","Manageable","Difficult","Overwhelming"],
["How often do you take breaks when studying?","Regularly","Occasionally","Rarely","Never"],
["How often do you feel pressure to meet others' expectations?","Never","Sometimes","Often","Almost always"],
["How hopeful do you feel about solving difficult problems?","Very hopeful","Hopeful","Unsure","Not hopeful"],
["How often do you feel distracted in class or study sessions?","Never","Sometimes","Often","Almost always"],
["How easy is it to get emotional support when needed?","Very easy","Easy","Difficult","Very difficult"],
["How often do you feel tense around peers?","Never","Sometimes","Often","Almost always"],
["How often do you enjoy your daily life?","Always","Often","Sometimes","Rarely"],
["How often do you feel unable to cope with problems?","Never","Sometimes","Often","Almost always"],
["How often do you seek help for emotional difficulties?","Always","Often","Sometimes","Never"],
["How often do changes in routine affect your mood?","Never","Sometimes","Often","Almost always"],
["How satisfied are you with your social relationships?","Very satisfied","Satisfied","Unsatisfied","Very unsatisfied"],
["How often do you find your mind wandering from tasks?","Never","Sometimes","Often","Almost always"],
["How prepared do you feel for unexpected challenges?","Very prepared","Prepared","Somewhat prepared","Not prepared"],
["How often do you feel emotionally balanced?","Always","Often","Sometimes","Rarely"]
];

await mongoose.connect(process.env.MONGO_URI);
await Question.deleteMany({});
await Question.insertMany(questions.map(([questionText, optionA, optionB, optionC, optionD]) => ({ questionText, optionA, optionB, optionC, optionD, category: "Mental Health" })));
console.log("Seeded 50 mental health questions");
await mongoose.disconnect();
