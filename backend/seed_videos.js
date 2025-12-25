import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from './models/Video.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const dataset = {
    "medicalDomains": [
        {
            "domain": "Physiotherapist",
            "problems": [
                {
                    "problem": "Back Pain",
                    "videos": [
                        {
                            "title": "Back Pain Relief Exercises & Stretches – Ask Doctor Jo",
                            "youtubeId": "2VuLBYrgG94",
                            "youtubeUrl": "https://www.youtube.com/watch?v=2VuLBYrgG94",
                            "source": "Ask Doctor Jo",
                            "level": "Beginner"
                        },
                        {
                            "title": "8 Best Exercises to Treat Lower Back Pain",
                            "youtubeId": "HXSZHLGNSyU",
                            "youtubeUrl": "https://www.youtube.com/watch?v=HXSZHLGNSyU",
                            "source": "Physical Therapy",
                            "level": "Beginner"
                        }
                    ]
                },
                {
                    "problem": "Knee Pain",
                    "videos": [
                        {
                            "title": "7 Best Knee Strengthening Exercises – Ask Doctor Jo",
                            "youtubeId": "pOrc3zADC7k",
                            "youtubeUrl": "https://www.youtube.com/watch?v=pOrc3zADC7k",
                            "source": "Ask Doctor Jo",
                            "level": "Beginner"
                        },
                        {
                            "title": "Relieve Knee Pain in Minutes – Follow Along",
                            "youtubeId": "3gbbjlQkWe4",
                            "youtubeUrl": "https://www.youtube.com/watch?v=3gbbjlQkWe4",
                            "source": "Physio Exercises",
                            "level": "Beginner"
                        }
                    ]
                },
                {
                    "problem": "Shoulder Pain",
                    "videos": [
                        {
                            "title": "5 Minute Shoulder Pain Relief Exercises",
                            "youtubeId": "IXf8N9tb88c",
                            "youtubeUrl": "https://www.youtube.com/watch?v=IXf8N9tb88c",
                            "source": "Jeffrey Peng MD",
                            "level": "Beginner"
                        },
                        {
                            "title": "Rotator Cuff & Shoulder Rehab Exercises",
                            "youtubeId": "1Wy8jh4QQH8",
                            "youtubeUrl": "https://www.youtube.com/watch?v=1Wy8jh4QQH8",
                            "source": "Physical Therapy",
                            "level": "Intermediate"
                        }
                    ]
                }
            ]
        },
        {
            "domain": "Orthopedic",
            "problems": [
                {
                    "problem": "Post Surgery Joint Recovery",
                    "videos": [
                        {
                            "title": "Orthopedic Low Back Rehabilitation Exercises",
                            "youtubeId": "jQQ_yOVenRs",
                            "youtubeUrl": "https://www.youtube.com/watch?v=jQQ_yOVenRs",
                            "source": "Orthopedic Rehab",
                            "level": "Beginner"
                        },
                        {
                            "title": "Knee Flexion & Strength After Injury",
                            "youtubeId": "b7yQwf-K7z0",
                            "youtubeUrl": "https://www.youtube.com/watch?v=b7yQwf-K7z0",
                            "source": "E3 Rehab",
                            "level": "Intermediate"
                        }
                    ]
                },
                {
                    "problem": "Joint Pain",
                    "videos": [
                        {
                            "title": "Top Knee Strengthening Exercises – No Equipment",
                            "youtubeId": "h_bgIN5r5JY",
                            "youtubeUrl": "https://www.youtube.com/watch?v=h_bgIN5r5JY",
                            "source": "Physio Strength",
                            "level": "Beginner"
                        },
                        {
                            "title": "Shoulder Instability & Dislocation Rehab",
                            "youtubeId": "fbV6EpgXIaw",
                            "youtubeUrl": "https://www.youtube.com/watch?v=fbV6EpgXIaw",
                            "source": "Orthopedic PT",
                            "level": "Intermediate"
                        }
                    ]
                }
            ]
        },
        {
            "domain": "Neurologist",
            "problems": [
                {
                    "problem": "Sciatica",
                    "videos": [
                        {
                            "title": "Sciatic Nerve Pain Relief Exercises",
                            "youtubeId": "KGOv7sDiW_U",
                            "youtubeUrl": "https://www.youtube.com/watch?v=KGOv7sDiW_U",
                            "source": "Dr. Rowe",
                            "level": "Beginner"
                        },
                        {
                            "title": "Sciatica Stretches & Mobility Exercises",
                            "youtubeId": "zzuxpAoWVcE",
                            "youtubeUrl": "https://www.youtube.com/watch?v=zzuxpAoWVcE",
                            "source": "Physical Therapy",
                            "level": "Beginner"
                        }
                    ]
                },
                {
                    "problem": "Neck Pain",
                    "videos": [
                        {
                            "title": "Best Neck Pain Relief Exercises",
                            "youtubeId": "IOKNxhzJ1Tg",
                            "youtubeUrl": "https://www.youtube.com/watch?v=IOKNxhzJ1Tg",
                            "source": "Physio Neck Rehab",
                            "level": "Beginner"
                        },
                        {
                            "title": "30 Second Neck & Shoulder Pain Relief",
                            "youtubeId": "QLFvCtfEV1g",
                            "youtubeUrl": "https://www.youtube.com/watch?v=QLFvCtfEV1g",
                            "source": "Quick Rehab",
                            "level": "Beginner"
                        }
                    ]
                }
            ]
        }
    ]
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        console.log("Clearing existing videos...");
        await Video.deleteMany({});

        const videosToInsert = [];

        dataset.medicalDomains.forEach(domainData => {
            const domain = domainData.domain;
            domainData.problems.forEach(problemData => {
                const problem = problemData.problem;
                problemData.videos.forEach(v => {
                    videosToInsert.push({
                        ...v,
                        domain,
                        problem
                    });
                });
            });
        });

        console.log(`Inserting ${videosToInsert.length} videos...`);
        await Video.insertMany(videosToInsert);
        console.log("Done!");

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

run();
