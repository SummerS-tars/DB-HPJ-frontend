question:

in the page /raw-answers
thought the request is correct and get response, but no answers are presented

request:

```txt
GET 
http://localhost:8080/api/v1/raw-answers?page=0&size=20&sortBy=id&sortDirection=asc&sourcePlatform=stackoverflow
```

response: 200 OK

```json
{
    "success": true,
    "data": {
        "content": [
            {
                "id": 1,
                "rawQuestionId": 88,
                "content": "Wine is actually using gettimeofday() to implement QueryPerformanceCounter() and it is known to make many Windows games work on Linux and Mac. Starts http://source.winehq.org/source/dlls/kernel32/cpu.c#L312 leads to http://source.winehq.org/source/dlls/ntdll/time.c#L448",
                "sourcePlatform": "stackoverflow",
                "postId": 1290,
                "score": 11
            },
            {
                "id": 2,
                "rawQuestionId": 88,
                "content": "\"From my experience, and from what I've read across the internet, the answer is \"No",
                "sourcePlatform": "stackoverflow",
                "postId": null,
                "score": 93
            },
            {
                "id": 3,
                "rawQuestionId": 88,
                "content": "Maybe. But you have bigger problems. gettimeofday() can result in incorrect timings if there are processes on your system that change the timer (ie, ntpd). On a \"normal\" Linux, though, I believe the resolution of gettimeofday() is 10us. It can jump forward and backward and time, consequently, based on the processes running on your system. This effectively makes the answer to your question no. You should look into clock_gettime(CLOCK_MONOTONIC) for timing intervals. It suffers from several fewer issues due to things like multi-core systems and external clock settings. Also, look into the clock_getres() function.",
                "sourcePlatform": "stackoverflow",
                "postId": 98,
                "score": 63
            },
            {
                "id": 4,
                "rawQuestionId": 88,
                "content": "The actual resolution of gettimeofday() depends on the hardware architecture. Intel processors as well as SPARC machines offer high resolution timers that measure microseconds. Other hardware architectures fall back to the system鈥檚 timer, which is typically set to 100 Hz. In such cases, the time resolution will be less accurate. I obtained this answer from High Resolution Time Measurement and Timers, Part I",
                "sourcePlatform": "stackoverflow",
                "postId": 99,
                "score": 9
            },
            {
                "id": 5,
                "rawQuestionId": 88,
                "content": "\"High Resolution, Low Overhead Timing for Intel Processors If you're on Intel hardware, here's how to read the CPU real-time instruction counter. It will tell you the number of CPU cycles executed since the processor was booted. This is probably the finest-grained counter you can get for performance measurement. Note that this is the number of CPU cycles. On linux you can get the CPU speed from /proc/cpuinfo and divide to get the number of seconds. Converting this to a double is quite handy. When I run this on my box, I get 11867927879484732 11867927879692217 it took this long to call printf: 207485 Here's the Intel developer's guide that gives tons of detail. #include #include inline uint64_t rdtsc() { uint32_t lo, hi; __asm__ __volatile__ ( \"xorl %%eax",
                "sourcePlatform": "stackoverflow",
                "postId": null,
                "score": 367
            },
            {
                "id": 6,
                "rawQuestionId": 88,
                "content": "So it says microseconds explicitly, but says the resolution of the system clock is unspecified. I suppose resolution in this context means how the smallest amount it will ever be incremented? The data structure is defined as having microseconds as a unit of measurement, but that doesn't mean that the clock or operating system is actually capable of measuring that finely. Like other people have suggested, gettimeofday() is bad because setting the time can cause clock skew and throw off your calculation. clock_gettime(CLOCK_MONOTONIC) is what you want, and clock_getres() will tell you the precision of your clock.",
                "sourcePlatform": "stackoverflow",
                "postId": 522,
                "score": 9
            },
            {
                "id": 7,
                "rawQuestionId": 88,
                "content": "@Bernard: I have to admit, most of your example went straight over my head. It does compile, and seems to work, though. Is this safe for SMP systems or SpeedStep? That's a good question... I think the code's ok. From a practical standpoint, we use it in my company every day, and we run on a pretty wide array of boxes, everything from 2-8 cores. Of course, YMMV, etc, but it seems to be a reliable and low-overhead (because it doesn't make a context switch into system-space) method of timing. Generally how it works is: declare the block of code to be assembler (and volatile, so the optimizer will leave it alone). execute the CPUID instruction. In addition to getting some CPU information (which we don't do anything with) it synchronizes the CPU's execution buffer so that the timings aren't affected by out-of-order execution. execute the rdtsc (read timestamp) execution. This fetches the number of machine cycles executed since the processor was reset. This is a 64-bit value, so with current CPU speeds it will wrap around every 194 years or so. Interestingly, in the original Pentium reference, they note it wraps around every 5800 years or so. the last couple of lines store the values from the registers into the variables hi and lo, and put that into the 64-bit return value. Specific notes: out-of-order execution can cause incorrect results, so we execute the \"cpuid\" instruction which in addition to giving you some information about the cpu also synchronizes any out-of-order instruction execution. Most OS's synchronize the counters on the CPUs when they start, so the answer is good to within a couple of nano-seconds. The hibernating comment is probably true, but in practice you probably don't care about timings across hibernation boundaries. regarding speedstep: Newer Intel CPUs compensate for the speed changes and returns an adjusted count. I did a quick scan over some of the boxes on our network and found only one box that didn't have it: a Pentium 3 running some old database server. (these are linux boxes, so I checked with: grep constant_tsc /proc/cpuinfo) I'm not sure about the AMD CPUs, we're primarily an Intel shop, although I know some of our low-level systems gurus did an AMD evaluation. Hope this satisfies your curiosity, it's an interesting and (IMHO) under-studied area of programming. You know when Jeff and Joel were talking about whether or not a programmer should know C? I was shouting at them, \"hey forget that high-level C stuff... assembler is what you should learn if you want to know what the computer is doing!\"",
                "sourcePlatform": "stackoverflow",
                "postId": 931,
                "score": 19
            },
            {
                "id": 8,
                "rawQuestionId": 88,
                "content": "Reading the RDTSC is not reliable in SMP systems, since each CPU maintains their own counter and each counter is not guaranteed to by synchronized with respect to another CPU. I might suggest trying clock_gettime(CLOCK_REALTIME). The posix manual indicates that this should be implemented on all compliant systems. It can provide a nanosecond count, but you probably will want to check clock_getres(CLOCK_REALTIME) on your system to see what the actual resolution is.",
                "sourcePlatform": "stackoverflow",
                "postId": 14807,
                "score": 3
            },
            {
                "id": 9,
                "rawQuestionId": 88,
                "content": "You may be interested in Linux FAQ for clock_gettime(CLOCK_REALTIME)",
                "sourcePlatform": "stackoverflow",
                "postId": 14817,
                "score": 14
            },
            {
                "id": 10,
                "rawQuestionId": 88,
                "content": "This answer mentions problems with the clock being adjusted. Both your problems guaranteeing tick units and the problems with the time being adjusted are solved in C++11 with the library. The clock std::chrono::steady_clock is guaranteed not to be adjusted, and furthermore it will advance at a constant rate relative to real time, so technologies like SpeedStep must not affect it. You can get typesafe units by converting to one of the std::chrono::duration specializations, such as std::chrono::microseconds. With this type there's no ambiguity about the units used by the tick value. However, keep in mind that the clock doesn't necessarily have this resolution. You can convert a duration to attoseconds without actually having a clock that accurate.",
                "sourcePlatform": "stackoverflow",
                "postId": 11211298,
                "score": 6
            }
        ],
        "pageable": {
            "pageNumber": 0,
            "pageSize": 20,
            "sort": {
                "empty": false,
                "sorted": true,
                "unsorted": false
            },
            "offset": 0,
            "paged": true,
            "unpaged": false
        },
        "last": true,
        "totalElements": 10,
        "totalPages": 1,
        "size": 20,
        "number": 0,
        "sort": {
            "empty": false,
            "sorted": true,
            "unsorted": false
        },
        "first": true,
        "numberOfElements": 10,
        "empty": false
    },
    "message": null
}
```