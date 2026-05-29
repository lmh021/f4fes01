import { Student, ExamSessionInfo, StudentMarks, AttendanceStatus } from './types';

export const EXAM_SESSIONS: ExamSessionInfo[] = [
  { session: 'A', prepTime: '08:20-08:30', examTime: '08:35-08:50', groups: [1, 2, 3, 4] },
  { session: 'B', prepTime: '08:35-08:45', examTime: '08:50-09:05', groups: [5, 6, 7, 8] },
  { session: 'C', prepTime: '08:50-09:00', examTime: '09:05-09:20', groups: [9, 10, 11, 12] },
  { session: 'D', prepTime: '09:20-09:30', examTime: '09:35-09:50', groups: [13, 14, 15, 16] },
  { session: 'E', prepTime: '09:35-09:45', examTime: '09:50-10:05', groups: [17, 18, 19, 20] },
  { session: 'F', prepTime: '09:50-10:00', examTime: '10:05-10:20', groups: [21, 22, 23, 24] },
  { session: 'G', prepTime: '10:20-10:30', examTime: '10:35-10:50', groups: [25, 26, 27, 28] },
  { session: 'H', prepTime: '10:35-10:45', examTime: '10:50-11:05', groups: [29, 30, 31, 32] },
  { session: 'I', prepTime: '10:50-11:00', examTime: '11:05-11:20', groups: [33, 34, 35, 36] },
  { session: 'J', prepTime: '11:05-11:15', examTime: '11:20-11:35', groups: [37, 38, 39, 40] },
  { session: 'K', prepTime: '11:20-11:30', examTime: '11:35-11:50', groups: [41, 42] },
];

const RAW_CSV = `1,4C,25,Shen Jian Dong,3,A,1,0810
2,4D,5,Chan Yu Hin,1,A,1,0810
3,4E,16,Law Hei Lok Jaevis,4,A,1,0810
4,4E,17,Lee Hoi Kit,2,A,1,0810
5,4A,15,Ip Pok Man,5,A,2,0810
6,4C,26,Shum Hoo Cheung,6,A,2,0810
7,4D,7,Cheng Kai Hei Cybi,7,A,2,0810
8,4E,14,Lam Ho Sum,8,A,2,0810
9,4A,19,Lam Zit,12,A,3,0810
10,4B,11,Chu Pak Hei,9,A,3,0810
11,4D,18,Lam Tsun Ting,10,A,3,0810
12,4E,33,Yuen Yui Hei,11,A,3,0810
13,4B,24,Loo Anchor,13,A,4,0810
14,4C,22,Leung Man Nok Cyrus,15,A,4,0810
15,4D,30,Wong Tse Yu Clarence,14,A,4,0810
16,4E,13,Lai Yu Tung,16,A,4,0810
17,4C,12,Chow Yu Wing,17,B,5,0825
18,4C,27,Tsui Chun Ting,19,B,5,0825
19,4D,6,Chein Whai Chien Wyatt,20,B,5,0825
20,4E,7,Chu Tsz Ho Arthur,18,B,5,0825
21,4A,5,Chan Yin Wai,22,B,6,0825
22,4A,8,Cheung Ching Kit,23,B,6,0825
23,4D,20,Li Sihan,24,B,6,0825
24,4D,28,Wong Chit,21,B,6,0825
25,4B,5,Chan Pak Kwan,28,B,7,0825
26,4B,18,Kwok Chun Ting,25,B,7,0825
27,4B,28,Siu Chak Sum,27,B,7,0825
28,4D,25,So Ryan,26,B,7,0825
29,4A,22,Lo Chun Yin,30,B,8,0825
30,4D,13,Hsieh Ming Ho,29,B,8,0825
31,4D,19,Li Louis Ka Wo,32,B,8,0825
32,4E,10,Ho Ho Kiu,31,B,8,0825
33,4A,3,Chan Chun Ting,33,C,9,0840
34,4A,30,Siu Hoi Long,36,C,9,0840
35,4D,15,Kajimoto Kazuki,35,C,9,0840
36,4E,27,Xiang Alan,34,C,9,0840
37,4A,10,Chu Chun Lok,39,C,10,0840
38,4C,20,Lei Yam Ki,37,C,10,0840
39,4D,23,Luk Hei Man,40,C,10,0840
40,4E,6,Chong Chun Hei Isaac,38,C,10,0840
41,4C,13,Chui Yat Long,43,C,11,0840
42,4C,17,Kwan Kai Yu,41,C,11,0840
43,4D,29,Wong Chun Him Miles,42,C,11,0840
44,4E,26,Wong Tsz Hin,44,C,11,0840
45,4B,6,Chen Wesley Shun Hay,45,C,12,0840
46,4B,7,Cheng Ho Long,48,C,12,0840
47,4C,14,Cu Hay In,46,C,12,0840
48,4E,18,Lee Tsz Yin,47,C,12,0840
49,4A,29,Sin Cheuk Ting,52,D,13,0910
50,4C,8,Cheng Ping Chi,50,D,13,0910
51,4C,10,Cheung Ho Pok,49,D,13,0910
52,4E,19,Liang Chun Yui,51,D,13,0910
53,4B,13,Fu Hao,54,D,14,0910
54,4B,22,Leung Ho Ching,55,D,14,0910
55,4B,31,Wong Tsz On,56,D,14,0910
56,4D,12,Guo Garin,53,D,14,0910
57,4A,17,Kuan Sheung Tang,60,D,15,0910
58,4B,10,Chow Chun Lok Alvin,57,D,15,0910
59,4B,26,Ng Kei Nam Jasper,59,D,15,0910
60,4C,11,Choi Ho Yan,58,D,15,0910
61,4A,24,Mar Yat Long,64,D,16,0910
62,4B,23,Liu Qi Chen,61,D,16,0910
63,4E,4,Cheung Tsz Yung,62,D,16,0910
64,4E,11,Hui Cheuk Hei,63,D,16,0910
65,4A,27,Pang Pak Hang Marcus,68,E,17,0925
66,4C,23,Ngan Hoi Hei,67,E,17,0925
67,4C,29,Wong Chi Yi,66,E,17,0925
68,4E,5,Chiu Matthew,65,E,17,0925
69,4B,14,Jia Wing Hong,72,E,18,0925
70,4C,7,Chen Xuhong William,69,E,18,0925
71,4C,32,Yu Tin Yiu,71,E,18,0925
72,4D,4,Chan Yin Yuk,70,E,18,0925
73,4A,2,Au-Yeung Nicholas,75,E,19,0925
74,4A,7,Cheung Chi Yin,73,E,19,0925
75,4C,5,Chan Tai Yu,76,E,19,0925
76,4C,19,Lee See Hang Zecus,74,E,19,0925
77,4A,28,Poon Shing Chun Jeffrey,78,E,20,0925
78,4B,9,Cheung Will,79,E,20,0925
79,4B,12,Fan Kok Pan Justin,77,E,20,0925
80,4B,16,Kwan Aden Shin Chi,80,E,20,0925
81,4A,1,Au Pak Ki,83,F,21,0940
82,4B,17,Kwan Tsz Chung,81,F,21,0940
83,4D,26,Sze Hui Lok,84,F,21,0940
84,4E,12,Iu Wang Ching,82,F,21,0940
85,4B,32,Yang Hansen,87,F,22,0940
86,4C,33,Zhang Chenyi,86,F,22,0940
87,4D,16,Kwan Pak Kei,88,F,22,0940
88,4E,21,Poon Ngai Chun,85,F,22,0940
89,4A,6,Chau Kun Fung Moses,89,F,23,0940
90,4A,11,Fan Kin Fung,90,F,23,0940
91,4D,34,Zhou Junrong,91,F,23,0940
92,4E,3,Cheuk Sin Hang,92,F,23,0940
93,4A,23,Lo Chung Tin,93,F,24,0940
94,4B,2,Chan Ka Cheuk,94,F,24,0940
95,4B,3,Chan Ling Sum,96,F,24,0940
96,4D,22,Li Yanzhen,95,F,24,0940
97,4A,35,Yuen Lok Luc,98,G,25,1010
98,4D,10,Chong Tsz Fung,100,G,25,1010
99,4E,1,Cheng Alan,99,G,25,1010
100,4E,9,Ho Ching Ho,97,G,25,1010
101,4A,16,Kok Jason,102,G,26,1010
102,4B,20,Lau Lai Kiu,104,G,26,1010
103,4B,27,Or Kwan Yin,103,G,26,1010
104,4E,22,Sung Yui Chit,101,G,26,1010
105,4A,9,Chow Lap Man Evan,108,G,27,1010
106,4B,19,Lam C Yuen Yannis,106,G,27,1010
107,4C,21,Leung Hoi Hei Geoffrey,105,G,27,1010
108,4D,33,Zhang Shing Yuen,107,G,27,1010
109,4B,15,Kong Chun Lam,110,G,28,1010
110,4C,6,Chan Tsz Hei,109,G,28,1010
111,4E,31,Yip Cheuk Him,112,G,28,1010
112,4E,34,Zeng Zhangchenhao,111,G,28,1010
113,4A,14,Ip Ho Sum,114,H,29,1025
114,4B,21,Law Hong Ting,113,H,29,1025
115,4C,3,Chan Pui Chung Thomas,115,H,29,1025
116,4E,25,Tang Hayden,116,H,29,1025
117,4A,12,Ho Ka Chiu,118,H,30,1025
118,4D,8,Cheung Kyle Ka-Hay,120,H,30,1025
119,4D,17,Lai Kwun Shing,117,H,30,1025
120,4D,27,Tung Chun Pang Gordon,119,H,30,1025
121,4A,4,Chan Pak Yeung,122,H,31,1025
122,4B,4,Chan Pak Hei,123,H,31,1025
123,4D,24,Sin Lok Yin,124,H,31,1025
124,4E,2,Cheng Ping Ho,121,H,31,1025
125,4B,30,Wong Tin Cheuk,125,H,32,1025
126,4C,15,Fung Hei Yeung,126,H,32,1025
127,4C,16,Huang Zexu,127,H,32,1025
128,4D,32,Yeung Long Hei Angus,128,H,32,1025
129,4A,21,Lee Cheuk Hin Carson,131,I,33,1040
130,4A,34,Yuen Bosco,130,I,33,1040
131,4C,9,Cheng Yiu Ting,132,I,33,1040
132,4E,28,Xiao Eric,129,I,33,1040
133,4A,31,Ting Ho Shan,135,I,34,1040
134,4A,33,Wong Cheuk Him,133,I,34,1040
135,4B,33,Yeung Nok Hei Brian,136,I,34,1040
136,4E,8,Gao Yang,134,I,34,1040
137,4C,1,Chan Nok,137,I,35,1040
138,4C,2,Chan Pak Cay,138,I,35,1040
139,4D,1,Au Pak Qiu Duncan,140,I,35,1040
140,4E,20,Ma Muhan,139,I,35,1040
141,4A,32,To Yu Hin Desmond,144,I,36,1040
142,4C,24,Pang King Ki,143,I,36,1040
143,4E,23,Tai Tsz Yui,141,I,36,1040
144,4E,24,Tang Guocheng,142,I,36,1040
145,4B,25,Mak Hui Yeung Ian,146,J,37,1055
146,4C,30,Wong Ngai Yu,147,J,37,1055
147,4D,9,Cheung Yi San,148,J,37,1055
148,4E,30,Yau Pak Lam,145,J,37,1055
149,4B,8,Cheung Ka Wai,150,J,38,1055
150,4C,34,Zhou Kwun Ting,149,J,38,1055
151,4D,2,Chan Chak Hin Bosco,152,J,38,1055
152,4D,11,Chu King Ching,151,J,38,1055
153,4A,13,Hsu Chun Kiu Sirus,155,J,39,1055
154,4B,1,Chan Chun To,156,J,39,1055
155,4C,31,Wu Yu Cheung,153,J,39,1055
156,4E,32,Young Man To,154,J,39,1055
157,4A,20,Lau Yuk Leung,160,J,40,1055
158,4A,25,Mok Ho Sun Oliver,159,J,40,1055
159,4B,29,Wong Lok Tin,157,J,40,1055
160,4C,18,Lau Kam Hung,158,J,40,1055
161,4C,4,Chan Sheung Chit,164,K,41,1110
162,4D,3,Chan Pak Yin Matthew,163,K,41,1110
163,4E,15,Lam Josiah,161,K,41,1110
164,4E,29,Yao Pak Him,162,K,41,1110
165,4A,18,Lam Kheiron,166,K,42,1110
166,4A,26,Ng Shing Hei Lincoln,167,K,42,1110
167,4D,31,Yau Cheuk Lok,165,K,42,1110`;

export function getInitialStudents(): Student[] {
  const lines = RAW_CSV.split('\n');
  return lines
    .map((line) => {
      const parts = line.split(',');
      if (parts.length < 8) return null;
      const id = parseInt(parts[0].trim(), 10);
      const klass = parts[1].trim();
      const no = parseInt(parts[2].trim(), 10);
      const ename = parts[3].trim();
      const seq = parseInt(parts[4].trim(), 10);
      const session = parts[5].trim();
      const group = parseInt(parts[6].trim(), 10);
      const rawReportTime = parts[7].trim();
      
      // format report time nicely (e.g. "0810" -> "08:10")
      let reportTime = rawReportTime;
      if (rawReportTime.length === 4) {
        reportTime = `${rawReportTime.substring(0, 2)}:${rawReportTime.substring(2)}`;
      }

      const initialMarks: StudentMarks = {
        pronunciation: 0,
        vocabulary: 0,
        ideas: 0,
        communication: 0,
        individualResponse: 0,
        total: 0,
        remarks: '',
        marked: false,
      };

      // Assign exam date based on session:
      // Session A, B, C, D -> 2026-06-11
      // Session E, F, G, H -> 2026-06-12
      // Session I, J, K -> 2026-06-15
      let examDate = '2026-06-11';
      if (['E', 'F', 'G', 'H'].includes(session)) {
        examDate = '2026-06-12';
      } else if (['I', 'J', 'K'].includes(session)) {
        examDate = '2026-06-15';
      }

      return {
        id,
        class: klass,
        no,
        ename,
        seq,
        session,
        group,
        reportTime,
        date: examDate,
        attendance: 'Unmarked' as AttendanceStatus,
        marks: initialMarks,
      } as Student;
    })
    .filter((s): s is Student => s !== null);
}
