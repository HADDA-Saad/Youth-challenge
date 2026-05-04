package com.youthchallenge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class YouthChallengeApplication {

    public static void main(String[] args) {
        SpringApplication.run(YouthChallengeApplication.class, args);
    }
}
