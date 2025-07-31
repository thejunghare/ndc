import { supabase } from "@/db/supabase.tsx";

async function listCourse() {
    try {
        const { data, error } = await supabase
            .from("course")
            .select("name");

        if (error) throw error;

        console.log("Courses:", data);
    } catch (err) {
        console.error("Oops xSomething went wrong...", err);
    }
}

listCourse();
